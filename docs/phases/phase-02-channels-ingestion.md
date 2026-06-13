# Phase 2 — Channels & conversation ingestion

## Goal
End customers reach a brand through any supported channel — WhatsApp first, then web chat / email — and the agent sees a single threaded **Conversation** in the inbox. The system is built around an `IChannelProvider` abstraction so adding the next channel is days, not weeks.

This phase replaces the original "ticket-shaped" Phase 2. Strategic reframe: **AI-native unified inbox for D2C brands**, leading with WhatsApp Cloud API (direct with Meta, no BSP). See `docs/phases/README.md` for the positioning.

## User stories
- As an end customer messaging a brand on WhatsApp, I get an instant reply that actually answers my question — including order, return, and product questions from the brand's store.
- As an end customer using a brand's website chat widget or emailing support, the same thing happens.
- As an agent, conversations the AI couldn't confidently handle appear in my queue with an AI-generated summary + suggested next step.
- As an admin, I can connect a WhatsApp Business number via an embedded Meta signup flow and start receiving messages without leaving the app.
- As an admin, I can connect Shopify (the wedge integration) so the AI can answer order / return / product questions with real data.

## Launch scope
Three channels, in this priority order:

1. **WhatsApp Cloud API (direct)** — the wedge channel.
2. **Web chat widget** — own-built, embeddable. Required so we can demo without Meta verification.
3. **Email** — Postmark inbound; agents reply via the same conversation thread.

Instagram / Messenger / SMS / Telegram are deferred to **Phase 2.5** — same `IChannelProvider` interface, so each subsequent channel is ~1-2 weeks once Phase 2 lands.

## Architecture

### `IChannelProvider` abstraction
Every channel implements one interface. Lives at `lib/providers/channels/`.

```ts
// lib/core/channels.ts
import type { ChannelKind } from "@/generated/prisma/enums";

export interface ChannelRecord {
  id: string;
  organisationId: string;
  kind: ChannelKind;
  externalId: string;
  credentials: unknown;
  config: unknown;
}

export interface IncomingContact {
  externalIdentifier: string;  // normalized: phone for WA/SMS, email for email, IG handle for IG
  displayName?: string;
  phone?: string;
  email?: string;
}

export interface IncomingMessage {
  externalMessageId: string;
  contact: IncomingContact;
  body: string;
  richContent?: unknown;
  attachments?: IncomingAttachment[];
  replyToExternalId?: string;
  sentAt: Date;
}

export interface OutgoingMessage {
  conversationId: string;
  body?: string;
  template?: { name: string; language: string; variables: Record<string, string> };
  richContent?: unknown;
  attachments?: OutgoingAttachment[];
}

export type WebhookEvent =
  | { kind: "message"; channelId: string; message: IncomingMessage }
  | { kind: "delivery"; channelId: string; externalMessageId: string;
      status: "DELIVERED" | "READ" | "FAILED"; reason?: string }
  | { kind: "template_status"; channelId: string; externalTemplateId: string;
      status: "APPROVED" | "REJECTED"; reason?: string }
  | { kind: "channel_error"; channelId: string; reason: string };

export interface IChannelProvider {
  readonly kind: ChannelKind;

  connect(input: { organisationId: string; payload: unknown }): Promise<{
    externalId: string;
    displayName: string;
    credentials: unknown;
    config?: unknown;
  }>;

  disconnect(channel: ChannelRecord): Promise<void>;

  send(channel: ChannelRecord, message: OutgoingMessage): Promise<{
    externalMessageId: string;
    deliveredAt?: Date;
  }>;

  parseWebhook(input: {
    headers: Record<string, string>;
    body: unknown;
    rawBody: string;
  }): Promise<WebhookEvent[]>;

  submitTemplate?(channel: ChannelRecord, template: {
    name: string;
    language: string;
    category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
    bodyTemplate: string;
    variables: Array<{ name: string; example: string }>;
  }): Promise<{ externalTemplateId: string; status: "PENDING" }>;
}
```

A registry in the DI container maps `ChannelKind` → provider instance.

### Conversation state machine
```
        ┌──────────┐
inbound │   OPEN   │ ── AI takes a swing ──► AI_HANDLING
        └────┬─────┘                              │
             │ can't classify                     │ AI confident reply +
             ▼                                    │ customer keeps replying
        WAITING_AGENT ◄── escalate ───────────────┘
             │                                    │
        agent claims                              │ AI auto-resolves
             ▼                                    │ (e.g. "thanks!")
         ASSIGNED ────► RESOLVED ◄────────────────┘
             │              │
       agent resolves       │ 30 days no activity
                            ▼
                         ARCHIVED
```

Transitions are explicit methods on `ConversationService` — never raw DB writes from routes. Invariants:
- `RESOLVED` always sets `resolvedAt`.
- A `CONTACT` message on a `RESOLVED` conversation re-opens to `WAITING_AGENT` (preserves history; never spawns a duplicate conversation).

### Inbound flow (every channel uses the same pipeline)
```
1. POST /api/webhooks/<provider>
   ├─ verify signature (provider-specific)
   ├─ resolve Channel by external id in payload
   └─ enqueue `channel-webhook` job { providerKind, channelId, headers, rawBody }
   → return 200 immediately

2. Worker: process `channel-webhook`
   ├─ provider.parseWebhook(...) → events[]
   └─ for each event:
       ├─ message  → enqueue `inbound-message`
       ├─ delivery → update Message.deliveryStatus
       └─ template → update MessageTemplate.status

3. Worker: process `inbound-message`
   ├─ upsert Contact by (orgId, externalIdentifier)
   ├─ find/create Conversation (re-open RESOLVED/ARCHIVED for same contact+channel)
   ├─ persist Message (fetch attachments → R2 → store)
   ├─ update Conversation.lastMessageAt
   └─ enqueue `ai-process` { conversationId, newMessageId }
```

One webhook endpoint per provider serves all customers; channel lookup happens via the provider-side identifier in the payload (WABA phone-number id, FB Page id, etc.) — no per-customer URLs.

### Outbound flow (AI loop)
```
ai-process job:
1. Load Conversation + last N messages + Contact + Org integrations
2. If Shopify connected and contact matchable (shopifyCustomerId or email):
   ├─ fetch recent orders, returns, address (60s cache)
   └─ inject into AI context as structured data
3. AI decides one of:
   a) RESPOND_AUTO  → render reply, persist Message(author=AI, status=QUEUED),
                       transition Conversation → AI_HANDLING, enqueue outbound-send
   b) ESCALATE      → transition → WAITING_AGENT, post system message with reason
   c) PROPOSE_ACTION → render interactive buttons (Confirm/Cancel) to the customer,
                       on confirm enqueue `integration-action` job

outbound-send job:
1. provider.send(channel, outgoingMessage) → { externalMessageId }
2. Update Message: deliveryStatus=SENT, channelMessageId set
3. delivery webhook later updates DELIVERED/READ
```

### Guardrails (hard, AI cannot bypass)
- **Never executes integration writes without customer confirmation.** Refunds, address changes, order cancellations all flow PROPOSE_ACTION → customer taps Confirm → system executes. Eliminates the chargeback risk class.
- **Respects the 24h WhatsApp session window.** If a conversation is outside the window, AI must use an approved `MessageTemplate`; `outbound-send` rejects raw text and escalates if no template fits.

## Database schema changes

```prisma
enum ChannelKind {
  WHATSAPP
  INSTAGRAM
  MESSENGER
  EMAIL
  WEB_CHAT
  SMS
  TELEGRAM
}

enum ChannelStatus { CONNECTING ACTIVE ERROR DISCONNECTED }

model Channel {
  id              String        @id @default(cuid())
  organisationId  String        @map("organisation_id")
  organisation    Organisation  @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  kind            ChannelKind
  displayName     String        @map("display_name")
  externalId      String        @map("external_id")
  status          ChannelStatus @default(CONNECTING)
  credentials     Json
  config          Json          @default("{}")
  lastError       String?       @map("last_error")
  connectedAt     DateTime?     @map("connected_at")

  conversations Conversation[]
  templates     MessageTemplate[]
  events        ChannelEvent[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@unique([organisationId, kind, externalId])
  @@index([organisationId])
  @@map("channels")
}

model Contact {
  id                 String       @id @default(cuid())
  organisationId     String       @map("organisation_id")
  organisation       Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  name               String?
  email              String?
  phone              String?
  externalIdentifier String       @map("external_identifier")
  attributes         Json         @default("{}")
  shopifyCustomerId  String?      @map("shopify_customer_id")

  conversations Conversation[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@unique([organisationId, externalIdentifier])
  @@index([organisationId])
  @@map("contacts")
}

enum ConversationStatus { OPEN AI_HANDLING WAITING_AGENT ASSIGNED RESOLVED ARCHIVED }
enum AiUrgency { LOW MEDIUM HIGH CRITICAL }

model Conversation {
  id              String              @id @default(cuid())
  organisationId  String              @map("organisation_id")
  organisation    Organisation        @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  contactId       String              @map("contact_id")
  contact         Contact             @relation(fields: [contactId], references: [id])
  channelId       String              @map("channel_id")
  channel         Channel             @relation(fields: [channelId], references: [id])
  status          ConversationStatus  @default(OPEN)
  subject         String?
  assigneeId      String?             @map("assignee_id")
  assignee        Member?             @relation(fields: [assigneeId], references: [id])

  aiSummary       String?    @map("ai_summary")
  aiUrgency       AiUrgency? @map("ai_urgency")
  aiCategory      String?    @map("ai_category")

  lastMessageAt   DateTime  @map("last_message_at")
  resolvedAt      DateTime? @map("resolved_at")

  messages Message[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@index([organisationId, status])
  @@index([organisationId, assigneeId])
  @@index([organisationId, lastMessageAt])
  @@map("conversations")
}

enum MessageDirection      { INBOUND OUTBOUND }
enum MessageAuthor         { CONTACT AI AGENT SYSTEM }
enum MessageDeliveryStatus { QUEUED SENT DELIVERED READ FAILED }

model Message {
  id                 String                @id @default(cuid())
  organisationId     String                @map("organisation_id")
  organisation       Organisation          @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  conversationId     String                @map("conversation_id")
  conversation       Conversation          @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  direction          MessageDirection
  author             MessageAuthor
  authorMemberId     String?               @map("author_member_id")
  authorMember       Member?               @relation(fields: [authorMemberId], references: [id])
  body               String
  richContent        Json?                 @map("rich_content")
  channelMessageId   String?               @map("channel_message_id")
  replyToMessageId   String?               @map("reply_to_message_id")
  deliveryStatus     MessageDeliveryStatus @default(QUEUED) @map("delivery_status")
  failureReason      String?               @map("failure_reason")

  attachments MessageAttachment[]

  sentAt      DateTime  @default(now()) @map("sent_at")
  deliveredAt DateTime? @map("delivered_at")
  readAt      DateTime? @map("read_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  @@unique([organisationId, channelMessageId])
  @@index([conversationId, sentAt])
  @@map("messages")
}

enum AttachmentKind { IMAGE VIDEO AUDIO DOCUMENT LOCATION STICKER }

model MessageAttachment {
  id             String         @id @default(cuid())
  organisationId String         @map("organisation_id")
  organisation   Organisation   @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  messageId      String         @map("message_id")
  message        Message        @relation(fields: [messageId], references: [id], onDelete: Cascade)
  kind           AttachmentKind
  url            String
  mimeType       String?        @map("mime_type")
  fileName       String?        @map("file_name")
  sizeBytes      Int?           @map("size_bytes")
  createdAt      DateTime       @default(now()) @map("created_at")

  @@index([messageId])
  @@map("message_attachments")
}

enum MessageTemplateCategory { UTILITY MARKETING AUTHENTICATION }
enum MessageTemplateStatus   { DRAFT PENDING APPROVED REJECTED }

model MessageTemplate {
  id                 String                  @id @default(cuid())
  organisationId     String                  @map("organisation_id")
  organisation       Organisation            @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  channelId          String                  @map("channel_id")
  channel            Channel                 @relation(fields: [channelId], references: [id], onDelete: Cascade)
  name               String
  language           String
  category           MessageTemplateCategory
  bodyTemplate       String                  @map("body_template")
  variables          Json
  status             MessageTemplateStatus   @default(DRAFT)
  externalTemplateId String?                 @map("external_template_id")
  rejectionReason    String?                 @map("rejection_reason")
  approvedAt         DateTime?               @map("approved_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@unique([channelId, name, language])
  @@map("message_templates")
}

enum IntegrationKind   { SHOPIFY WOOCOMMERCE STRIPE }
enum IntegrationStatus { ACTIVE ERROR DISCONNECTED }

model Integration {
  id             String            @id @default(cuid())
  organisationId String            @map("organisation_id")
  organisation   Organisation      @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  kind           IntegrationKind
  status         IntegrationStatus @default(ACTIVE)
  credentials    Json
  config         Json              @default("{}")
  lastError      String?           @map("last_error")
  connectedAt    DateTime?         @map("connected_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@unique([organisationId, kind])
  @@map("integrations")
}

enum ChannelEventKind { MESSAGE_DELIVERED MESSAGE_READ MESSAGE_FAILED TEMPLATE_APPROVED TEMPLATE_REJECTED CHANNEL_ERROR }

model ChannelEvent {
  id             String           @id @default(cuid())
  organisationId String           @map("organisation_id")
  organisation   Organisation     @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  channelId      String           @map("channel_id")
  channel        Channel          @relation(fields: [channelId], references: [id], onDelete: Cascade)
  kind           ChannelEventKind
  payload        Json
  createdAt      DateTime         @default(now()) @map("created_at")

  @@index([channelId, createdAt])
  @@map("channel_events")
}
```

All new models are organisation-scoped; they slot into the existing tenancy guard with no new rules (`SCOPE_KEYS = ["organisationId", "userId"]` already covers them).

## Technical tasks

### Foundation
1. Run `pnpm db:push --force-reset` after merging the schema (dev only; production migration in a real `prisma migrate` once we have data worth keeping).
2. Define `IChannelProvider` interface and supporting types in `lib/core/channels.ts`.
3. Add `lib/services/conversation.service.ts` with the state-machine transitions as the only path to mutating `Conversation.status`.
4. Add `lib/services/contact.service.ts` with `upsertByExternalIdentifier`.
5. Extend `lib/container.ts` with a `channelProviders` registry keyed on `ChannelKind`.
6. Add credentials encryption helper at `lib/auth/secrets.ts` (AES-GCM over an `AUTH_ENCRYPTION_KEY` env var). Channel + Integration `credentials` columns must round-trip through it.

### WhatsApp Cloud API
7. Create `lib/providers/channels/whatsapp.ts` implementing `IChannelProvider`:
   - `connect` exchanges the Meta Embedded Signup payload (short-lived token → long-lived; subscribes our webhook to the WABA; fetches phone number display name).
   - `send` calls `POST https://graph.facebook.com/v21.0/{phoneNumberId}/messages` with text or template payloads.
   - `parseWebhook` verifies `X-Hub-Signature-256` against `META_APP_SECRET`, walks `entry[].changes[].value.{messages,statuses,errors}`.
   - `submitTemplate` calls `POST /{wabaId}/message_templates`.
8. Build Meta Embedded Signup component at `app/(dashboard)/settings/channels/whatsapp/connect/page.tsx` (loads Meta SDK script, opens FB login dialog, posts the result to a server action that calls `whatsapp.connect`).
9. Webhook handler `app/api/webhooks/whatsapp/route.ts`: verifies signature → enqueues `channel-webhook` job. Returns 200 in <200ms. Also implements GET handler for Meta's `hub.challenge` verification.

### Web chat widget (own-built)
10. Create `lib/providers/channels/web-chat.ts`. `connect` is a no-op that returns a generated `channelId`-keyed embed token. `send` and `parseWebhook` go via internal SSE (no external service).
11. Publish the loader script at `app/api/widget/[orgSlug]/loader.js/route.ts` (returns the JS bundle that mounts the chat iframe).
12. Embed page at `app/widget/[channelToken]/page.tsx` renders the customer-facing chat surface (reuse `components/widget/chat-widget.tsx` from the existing prototype).
13. WebSocket / SSE channel at `app/api/widget/[channelToken]/stream/route.ts` for realtime push to the embed.

### Email (Postmark)
14. `lib/providers/channels/email.ts`: `connect` registers the org's inbound address (`support+<slug>@inbound.<DOMAIN>`); `send` POSTs to Postmark's send API; `parseWebhook` validates the inbound payload and extracts thread keys from `Message-ID` / `In-Reply-To`.
15. Webhook handler `app/api/webhooks/postmark/route.ts`.

### Workers
16. `workers/processors/channelWebhook.ts` — generic, dispatches by `providerKind` to the right provider's `parseWebhook` and emits `WebhookEvent[]`.
17. `workers/processors/inboundMessage.ts` — contact upsert, conversation find/create/re-open, message persist (with attachment fetch → R2), enqueue `ai-process`.
18. `workers/processors/outboundSend.ts` — calls `provider.send`, updates message delivery state.
19. `workers/processors/aiProcess.ts` — **stub for Phase 2**: always returns ESCALATE, leaves conversation in `WAITING_AGENT`. Real AI behaviour lands in Phase 4. The stub still emits the system message so the UI surface is exercised end-to-end.
20. `workers/processors/integrationAction.ts` — stub; real action execution wires in Phase 4 with Shopify.

### Agent UI
21. Rebuild `app/(dashboard)/tickets/page.tsx` (or rename folder to `conversations/`) as a server component listing conversations for the current org. Filters in URL search params: `status`, `channelId`, `assigneeId`, `q`. Default tab "WAITING_AGENT".
22. `app/(dashboard)/conversations/[id]/page.tsx`: header (contact, channel, status, AI summary) + threaded message timeline + reply composer that posts to a server action calling `conversationService.replyAsAgent`.
23. Realtime: SSE channel at `app/api/conversations/stream/route.ts` pushes new-message + status-change events to open dashboard tabs (keyed on organisationId).

### Settings
24. New settings page `app/(dashboard)/settings/channels/page.tsx`: lists connected channels, each with status badge + "Disconnect" + per-channel detail page.
25. New settings page `app/(dashboard)/settings/integrations/page.tsx`: Shopify card (connect via OAuth), shows last sync time. Detailed Shopify wiring is Phase 2.5 — connect button persists credentials but no read/write yet.
26. New settings page `app/(dashboard)/settings/templates/page.tsx`: list WhatsApp templates with status badges, "Submit for approval" button calling `whatsapp.submitTemplate`.

### Storage
27. `lib/storage.ts` (Cloudflare R2 via S3-compatible SDK) with `putObject(orgId, key, body, contentType) → signed URL`.

### Public surfaces
28. Single `/api/widget/*` rate-limit middleware (Upstash) — 30 messages / contact / 5 min.
29. WhatsApp webhook does NOT need rate limit (signature-verified). Postmark inbound does NOT need rate limit (also signed).

### Tests
30. Unit: WhatsApp signature verifier; Postmark thread-key extraction; conversation state-machine transitions (every legal + every illegal).
31. Integration: POST a fixture WhatsApp webhook payload → assert Contact + Conversation + Message rows + `ai-process` job enqueued, all tenant-scoped to the right org.
32. Integration: agent reply server action → calls `provider.send` (mocked) → Message persisted with correct direction/author.

## AI integration points
- `ai-process` processor is a stub in this phase (always ESCALATE). Phase 4 owns the real model calls.
- This phase establishes the *data shape* the AI consumes: `Conversation`, `Message[]`, `Contact`, joined `Integration` (Shopify), and the action-proposal flow (PROPOSE_ACTION → interactive buttons → integration write). Phase 4 plugs in Claude and the prompt chain.

## Environment variables needed
```
META_APP_ID=
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=
META_SYSTEM_USER_ACCESS_TOKEN=

POSTMARK_INBOUND_WEBHOOK_SECRET=
POSTMARK_SERVER_TOKEN=
INBOUND_DOMAIN=inbound.resolv.ai

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=resolv-attachments

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

AUTH_ENCRYPTION_KEY=
```

## Definition of done
- [ ] Admin can connect a WhatsApp Business number via Meta Embedded Signup; channel row appears with `status = ACTIVE`.
- [ ] Sending a WhatsApp message to the connected number produces a `Conversation` + `Message` within 5 seconds, visible in `/conversations`.
- [ ] Replying from the dashboard delivers the message to the customer's WhatsApp (Meta returns 200, our delivery status updates on the next webhook).
- [ ] Web chat widget loads on a third-party page (smoke-tested via a static HTML file) and round-trips a message end-to-end.
- [ ] Emailing `support+<slug>@inbound.resolv.ai` lands in the same conversation surface; thread re-uses the same `Conversation` on reply.
- [ ] Attachments (image / document) round-trip via R2 — uploaded URLs visible in the dashboard, downloadable by agents.
- [ ] AI stub escalates every inbound message; the dashboard shows `WAITING_AGENT` with an "AI couldn't answer" system note.
- [ ] Tenancy guard: a fixture test attempting to read a foreign org's `Conversation`/`Message` throws.
- [ ] All new models are listed in the auto-generated `TENANT_SCOPED_MODELS`.

## Decisions deferred to Phase 2.5+
- **Cross-channel contact identity merge.** Phase 2 keeps `Contact` per channel (one row per `externalIdentifier`). Same person on WhatsApp + email = two Contacts. Merge logic comes after we have real cross-channel data.
- **Instagram / Messenger / SMS / Telegram providers.** Same interface, each ~1-2 weeks.
- **Shopify read/write integration.** Connect button persists credentials in Phase 2; AI consumption + action execution lands with Phase 4.
- **Broadcast / campaign tooling.** Reuses the same `MessageTemplate` + provider `send` surface. Phase 5 work.

## Estimated effort
**12 days.** Roughly:
- 2 days: schema + provider interface + DI wiring + encryption helper.
- 4 days: WhatsApp Cloud API provider (Embedded Signup is the hardest part).
- 1 day: Meta verification process (mostly waiting; runs in parallel).
- 2 days: web chat widget end-to-end.
- 1.5 days: email (Postmark) provider.
- 2 days: agent conversation list + detail + reply composer; SSE realtime.
- 1.5 days: settings pages (channels, integrations, templates).
- 1 day: tests + cleanup.

Meta Tech Provider verification (separate from coding work) takes 1-4 weeks and should be kicked off Day 1.

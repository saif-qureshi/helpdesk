# Phase 5 — AI self-service & auto-resolution

## Goal
A one-line script tag embedded on a customer's website opens a chat widget. Claude attempts to resolve the question. If it can't or the user requests a human, the conversation is converted to a ticket and escalated to the agent queue.

## User stories
- As a website visitor, I see a chat bubble in the bottom-right of a customer's site.
- As a visitor, I can ask a question and get a streamed AI answer in seconds.
- As a visitor, I can tap "Talk to a human" and leave my email; an agent picks it up.
- As an agent, an escalated chat appears in the queue with the full prior conversation pre-loaded.
- As an admin, I can customise widget colour, position, greeting, and which KB collections it can search.

## Technical tasks
1. Create `packages/widget/` as a small Vite + React build producing `widget.js` (≤ 25 KB gzipped). Output published to R2 at `https://cdn.helpdesk.app/widget.js`.
2. Loader script served at `app/(marketing)/widget/[publicKey]/loader.js/route.ts` that injects an iframe pointing at `app/widget/[publicKey]/page.tsx`. iframe sandboxing prevents host-site CSS leakage.
3. Add `WidgetConfig` model — per-org public widget settings (theme, greeting, allowed KB collection IDs).
4. Build `app/widget/[publicKey]/page.tsx` (no Clerk; resolves widget → org via `publicKey`). Renders chat UI using `useChat` from Vercel AI SDK.
5. Build `app/api/widget/chat/route.ts`:
   - Validate `publicKey`, rate-limit by visitor cookie + IP.
   - Persist conversation to a `WidgetConversation` + `WidgetMessage` table.
   - Stream response using `streamText({ model: anthropic(AI_WIDGET_MODEL), messages, tools: { searchKB, escalateToHuman } })`. (KB tool is stubbed until Phase 6; escalate tool creates a Ticket.)
6. Implement `escalateToHuman` tool: collects email if not set, creates a `Ticket` with `channel = CHAT`, copies `WidgetMessage`s into `Message` rows, marks conversation `escalated`, returns a confirmation string the model surfaces to the user.
7. Add an "Auto-resolved" classifier pass at conversation end: if the user reacts with `thumbs up` or explicit "thanks, that works", mark conversation `resolved` and increment org's deflection counter.
8. Add an agent-visible "Live chats" page `app/(dashboard)/chats/page.tsx` showing in-progress AI conversations with a "Take over" button (creates a Ticket and notifies the widget user).
9. Add `Organisation.publicWidgetKey` (auto-generated, rotatable) and a "Copy embed snippet" UI in `/settings/widget`.
10. Vitest: tests for the escalation tool and the rate limiter.
11. Playwright: open widget on a fixture HTML page → ask a question → escalate → assert ticket exists.

## Database schema changes
```prisma
model WidgetConfig {
  id             String   @id @default(cuid())
  organisationId String   @unique
  publicKey      String   @unique
  greeting       String   @default("Hi! How can I help?")
  primaryColor   String   @default("#111827")
  position       String   @default("bottom-right")
  kbCollectionIds String[] @default([])
  enabled        Boolean  @default(true)
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
}

model WidgetConversation {
  id             String   @id @default(cuid())
  organisationId String
  visitorId      String   // cookie-based
  visitorEmail   String?
  status         String   @default("active") // active | resolved | escalated | abandoned
  escalatedTicketId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  messages       WidgetMessage[]

  @@index([organisationId, status, createdAt])
}

model WidgetMessage {
  id              String @id @default(cuid())
  conversationId  String
  role            String  // user | assistant | tool
  content         String  @db.Text
  toolName        String?
  toolArgs        Json?
  createdAt       DateTime @default(now())
  conversation    WidgetConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
}
```

## AI integration points
- **Widget chat**: `streamText` with `claude-sonnet-4-6`, tool-use enabled. System prompt: "You are {orgName}'s support assistant. Use the search_kb tool before answering factual questions. If you don't know, call escalate_to_human."
- KB tool wired in Phase 6.

## Environment variables needed
```
AI_WIDGET_MODEL=claude-sonnet-4-6
WIDGET_CDN_URL=https://cdn.helpdesk.app
```

## Definition of done
- [ ] Adding `<script src="https://app.helpdesk.app/widget/<key>/loader.js" async></script>` to any HTML page opens the widget.
- [ ] AI answers stream visibly under 1s TTFB.
- [ ] Escalation produces a ticket and shows the conversation history in the agent UI.
- [ ] Widget styling doesn't leak into the host page (iframe isolation verified).
- [ ] Rate limit blocks abusive visitors (10 msg / min / visitor cookie).

## Estimated effort
**6 days**

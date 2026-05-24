# Phase 2 — Ticket ingestion (email + web form)

## Goal
Tickets arrive in an org's inbox from two sources — a public web form and a dedicated email address `support+<orgSlug>@inbound.<yourdomain>` — and appear in a `/tickets` list within seconds.

## User stories
- As an end customer, I can fill out a public form at `/{orgSlug}/contact` and submit a ticket without an account.
- As an end customer, I can email `support+acme@inbound.helpdesk.app` and have a ticket open in Acme's inbox.
- As an agent, I can see new tickets appear in the queue list, sorted by creation date.
- As an agent, I can see the full email thread (HTML + plaintext) on the ticket.

## Technical tasks
1. Add Prisma models (below) and `prisma migrate dev --name tickets`.
2. Pick **Postmark** as inbound email provider (cheapest with great inbound webhooks). Configure an inbound stream with webhook → `POST /api/webhooks/postmark`.
3. Create `app/api/webhooks/postmark/route.ts` verifying via shared-secret header. On success, enqueue `ticket-ingest` job with the raw payload — do not write to DB in the handler (Vercel timeout safety).
4. Create `workers/processors/ticketIngest.ts`:
   - Parse `To:` address → extract `orgSlug` from `support+<slug>@`.
   - Resolve `Organisation` by slug. If missing, drop with a logged warning.
   - Upsert `Contact` by email.
   - Hash `Message-ID` + `In-Reply-To` to find an existing `Ticket` (threading); else create a new `Ticket`.
   - Create a `Message` with `direction = INBOUND`, `channel = EMAIL`, sanitised HTML, plaintext, attachments stored to S3/R2.
   - Enqueue `ai-triage` job with the new ticket ID (Phase 4 will consume this).
5. Build public web form route `app/(marketing)/[orgSlug]/contact/page.tsx` (server component fetches org by slug; 404 otherwise). Use a React Server Action `submitContactForm` that:
   - Validates with `zod` (`name`, `email`, `subject`, `body`, optional `attachments[]`).
   - Rate-limits by IP via `@upstash/ratelimit` (`5 / min`).
   - Creates `Ticket` + `Message(direction: INBOUND, channel: WEB_FORM)` synchronously (small, safe).
   - Enqueues `ai-triage` job.
6. Add `app/(dashboard)/tickets/page.tsx`: server component listing tickets for the current org, paginated (cursor-based on `createdAt`), with filters in URL search params (`status`, `assigneeId`, `priority`, `q`).
7. Add `app/(dashboard)/tickets/[id]/page.tsx`: ticket header (subject, contact, status badge, priority badge) + message timeline (newest at bottom, rendered HTML in a sandboxed iframe for inbound).
8. Add S3/R2 client in `lib/storage.ts` with `putObject` returning a signed URL. Use Cloudflare R2 for cheap egress.
9. Wire `pusher` or **Postgres `LISTEN/NOTIFY`** for realtime list updates (defer realtime to Phase 3 if time-pressed; for now, refresh on page focus via `router.refresh()`).
10. Vitest: unit tests for email threading logic (`extractThreadKey`, `parseToHeader`).
11. Integration test: POST a fixture Postmark payload to the webhook → assert a ticket and message exist with the right org scoping.

## Database schema changes
```prisma
model Contact {
  id             String   @id @default(cuid())
  organisationId String
  email          String
  name           String?
  createdAt      DateTime @default(now())
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  tickets        Ticket[]

  @@unique([organisationId, email])
  @@index([organisationId])
}

model Ticket {
  id             String        @id @default(cuid())
  organisationId String
  contactId      String
  subject        String
  status         TicketStatus  @default(OPEN)
  priority       TicketPriority @default(NORMAL)
  channel        Channel
  assigneeId     String?       // Member.id
  threadKey      String?       // hashed message-id chain for email threading
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  closedAt       DateTime?

  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
  contact        Contact      @relation(fields: [contactId], references: [id])
  messages       Message[]

  @@index([organisationId, status, createdAt])
  @@index([organisationId, assigneeId])
  @@index([threadKey])
}

model Message {
  id          String        @id @default(cuid())
  ticketId    String
  direction   MessageDirection
  channel     Channel
  authorType  AuthorType    // CONTACT | AGENT | AI | SYSTEM
  authorId    String?       // Member.id when AGENT
  bodyHtml    String?
  bodyText    String        @db.Text
  attachments Json?         // [{key, name, size, contentType}]
  emailMessageId String?
  inReplyTo      String?
  createdAt   DateTime      @default(now())

  ticket      Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId, createdAt])
}

enum TicketStatus { OPEN PENDING ON_HOLD RESOLVED CLOSED }
enum TicketPriority { LOW NORMAL HIGH URGENT }
enum Channel { EMAIL WEB_FORM CHAT API }
enum MessageDirection { INBOUND OUTBOUND INTERNAL }
enum AuthorType { CONTACT AGENT AI SYSTEM }
```

## AI integration points
- None in this phase. The `ai-triage` job is enqueued but the processor is a no-op until Phase 4.

## Environment variables needed
```
POSTMARK_INBOUND_WEBHOOK_SECRET=
POSTMARK_SERVER_TOKEN=
INBOUND_DOMAIN=inbound.helpdesk.app
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=helpdesk-attachments
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Definition of done
- [ ] Posting to the public form creates a ticket and message; the page shows a confirmation.
- [ ] Sending an email to `support+<slug>@…` produces a ticket visible in `/tickets` within 10s.
- [ ] Replying to a ticket email threads correctly (no duplicate ticket).
- [ ] Attachments are uploaded to R2 and downloadable via signed URLs.
- [ ] Rate limit on the public form returns 429 after 5 submissions/min from one IP.

## Estimated effort
**5 days**

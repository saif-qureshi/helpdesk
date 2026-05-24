# Phase 10 — Integrations layer

## Goal
Workspaces can push events out (webhooks, Slack, Jira) and read/write tickets via a public REST API authenticated with API keys.

## User stories
- As an admin, I can create an API key with scoped permissions.
- As a developer, I can `POST /api/v1/tickets` with `Authorization: Bearer <key>` to create a ticket.
- As an admin, I can install a Slack app and choose which channel gets notifications for new/escalated tickets.
- As an agent, I can convert a ticket to a Jira issue with one click; the issue link is stored on the ticket.
- As an admin, I can subscribe a webhook URL to `ticket.created`, `ticket.updated`, `message.created` events with HMAC signatures.

## Technical tasks
1. Add `ApiKey`, `Webhook`, `WebhookDelivery`, `Integration` models.
2. Add `lib/auth/apiKey.ts` — extracts `Bearer` token, hashes (sha256), looks up `ApiKey`, returns `{ organisationId, scopes }` or 401. Apply to all `/api/v1/*` routes.
3. Build `app/api/v1/tickets/route.ts` (`POST` create, `GET` list) and `app/api/v1/tickets/[id]/route.ts` (`GET`, `PATCH`). Use the same zod schemas as the dashboard.
4. Add `/api/v1/messages` (`POST`) for adding messages to existing tickets.
5. Add OpenAPI spec at `/api/v1/openapi.json` generated from zod via `zod-to-openapi`; serve a Stoplight Elements page at `/api/v1/docs`.
6. Build webhook dispatcher: an internal event bus (`lib/events.ts emit(orgId, eventName, payload)`) used inside server actions and workers. `emit` enqueues to `webhook-deliver` queue.
7. `workers/processors/webhookDeliver.ts`: load subscribed webhooks for the org+event, POST with `X-Helpdesk-Signature: sha256=<hmac>` (HMAC key = webhook secret), record `WebhookDelivery` (status, response code, attempts). Exponential backoff up to 5 retries.
8. Slack integration: implement OAuth at `/api/integrations/slack/callback`, store `Integration` with workspace token, post messages via `chat.postMessage`. UI in `/settings/integrations`.
9. Jira integration: simpler — collect API token + base URL + project key; "Create Jira issue" action on ticket detail calls `POST /rest/api/3/issue`, stores the issue key on `Ticket.jiraIssueKey`.
10. Add `/settings/integrations` and `/settings/api` pages.
11. Vitest: HMAC signature, scope enforcement, retry/backoff math.
12. Integration test: create a webhook subscription → trigger a ticket → assert outbound POST received by a local test sink.

## Database schema changes
```prisma
model ApiKey {
  id             String @id @default(cuid())
  organisationId String
  name           String
  hash           String @unique           // sha256(token)
  prefix         String                   // first 8 chars for display
  scopes         String[]                 // tickets:read tickets:write messages:write
  createdById    String
  createdAt      DateTime @default(now())
  lastUsedAt     DateTime?
  revokedAt      DateTime?
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)

  @@index([organisationId])
}

model Webhook {
  id             String @id @default(cuid())
  organisationId String
  url            String
  secret         String
  events         String[]
  enabled        Boolean @default(true)
  createdAt      DateTime @default(now())
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)

  @@index([organisationId, enabled])
}

model WebhookDelivery {
  id          String @id @default(cuid())
  webhookId   String
  event       String
  payload     Json
  statusCode  Int?
  responseBody String? @db.Text
  attempts    Int  @default(0)
  deliveredAt DateTime?
  createdAt   DateTime @default(now())

  @@index([webhookId, createdAt])
}

model Integration {
  id             String @id @default(cuid())
  organisationId String
  provider       String  // slack | jira
  config         Json
  credentials    Json    // encrypted
  enabled        Boolean @default(true)
  createdAt      DateTime @default(now())

  @@unique([organisationId, provider])
}

model Ticket {
  // additions:
  jiraIssueKey String?
}
```

## AI integration points
- None directly. (Optional: AI-generated webhook payload summaries — defer.)

## Environment variables needed
```
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=
INTEGRATION_ENCRYPTION_KEY=         # 32-byte base64, for AES-GCM of credentials
PUBLIC_API_BASE_URL=https://app.helpdesk.app/api/v1
```

## Definition of done
- [ ] `POST /api/v1/tickets` with a valid key creates a ticket and triggers AI triage.
- [ ] Revoking a key (UI) returns 401 on the next call within seconds.
- [ ] Slack channel receives a formatted message on `ticket.escalated`.
- [ ] Jira "Create issue" stores the key and renders a link on the ticket.
- [ ] Webhook delivery retries on 500 and stops after 5 attempts, recorded in `WebhookDelivery`.
- [ ] Public docs page at `/api/v1/docs` renders the OpenAPI spec.

## Estimated effort
**6 days**

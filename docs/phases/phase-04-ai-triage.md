# Phase 4 — AI triage engine

## Goal
Every new ticket is classified (category, priority, sentiment, language), auto-tagged, routed via simple rules, and — when Claude's confidence ≥ threshold — a streaming draft reply appears in the composer waiting for agent approval.

## User stories
- As an agent, I see a "Suggested category", "Suggested priority", and "Sentiment" chip on every new ticket within 10s of arrival.
- As an agent, I see a "Draft reply (AI)" tab on the composer pre-filled with a streamed suggestion when confidence is high.
- As an admin, I can configure routing rules: `if category = "billing" → assign to @finance team`.
- As an admin, I can set the auto-draft confidence threshold (default 0.75).

## Technical tasks
1. Create `lib/ai/client.ts`: wraps `@anthropic-ai/sdk` with a tagged `claude(model, system, messages, tools?)` helper that logs `inputTokens`, `outputTokens`, `latencyMs`, `ticketId` to an `AiUsage` table.
2. Create `lib/ai/prompts/triage.ts` exporting:
   ```ts
   export const TRIAGE_SYSTEM = `You are an AI support triage assistant...`;
   export function buildTriageMessages(ticket: TriageInput): MessageParam[];
   ```
   Output shape enforced with a tool call (Claude tool use) returning JSON:
   ```json
   {
     "category": "billing|technical|account|feedback|other",
     "priority": "LOW|NORMAL|HIGH|URGENT",
     "sentiment": "positive|neutral|negative|angry",
     "language": "en|...",
     "summary": "1-sentence summary",
     "confidence": 0.0
   }
   ```
3. Create `workers/processors/aiTriage.ts` consuming the `ai-triage` queue (enqueued in Phase 2):
   - Load ticket + first inbound message.
   - Call `claude("claude-sonnet-4-6", TRIAGE_SYSTEM, buildTriageMessages(...))` with `tool_choice` forcing the JSON tool.
   - Persist into a new `TicketTriage` row.
   - Apply routing rules (next task).
   - If `confidence >= org.autoDraftThreshold`, enqueue `ai-reply` job.
4. Add `RoutingRule` model + `app/(dashboard)/settings/routing/page.tsx` UI (simple rule builder: `field op value → action`). Evaluate in `workers/processors/aiTriage.ts` after triage.
5. Create `workers/processors/aiReply.ts`:
   - Load ticket + last N messages (cap at 10) + (Phase 6 will add KB context here).
   - Stream Claude completion into a `TicketDraft` row updated incrementally — but expose it to the UI via **Vercel AI SDK** streaming on a dedicated endpoint.
6. Build `app/api/tickets/[id]/draft/route.ts` returning a streamed response using `streamText({ model: anthropic("claude-sonnet-4-6"), ... })`. The composer uses `useCompletion({ api: "/api/tickets/[id]/draft" })` to render the draft live.
7. In the composer (Phase 3 surface), add a "Draft (AI)" tab. When a draft exists, render it via `useCompletion` with `initialCompletion` and a "Regenerate", "Use as reply", and "Edit" set of actions.
8. Add a setting on `Organisation`: `autoDraftThreshold Float @default(0.75)`. Expose in `/settings/ai`.
9. Add Vitest unit tests for `evaluateRoutingRules(triage, rules)` covering all operators.
10. Add an integration test that posts a known ticket payload and asserts that `TicketTriage` is written and the assignee matches the routing rule.
11. Cost guardrail: per-org daily token cap from `Organisation.aiDailyTokenCap` (Phase 9 will use this for plan limits). When exceeded, skip AI jobs and write a `SYSTEM` message saying so.

## Database schema changes
```prisma
model TicketTriage {
  id         String   @id @default(cuid())
  ticketId   String   @unique
  category   String
  priority   TicketPriority
  sentiment  String
  language   String
  summary    String
  confidence Float
  model      String
  createdAt  DateTime @default(now())

  ticket     Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}

model TicketDraft {
  id        String   @id @default(cuid())
  ticketId  String   @unique
  bodyText  String   @db.Text
  bodyHtml  String   @db.Text
  model     String
  tokensIn  Int
  tokensOut Int
  createdAt DateTime @default(now())
  ticket    Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}

model RoutingRule {
  id             String @id @default(cuid())
  organisationId String
  name           String
  priority       Int      @default(0)   // lower runs first
  conditions     Json     // [{ field, op, value }]
  actions        Json     // [{ type: "assign", memberId }, { type: "tag", value }]
  enabled        Boolean  @default(true)
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)

  @@index([organisationId, enabled, priority])
}

model AiUsage {
  id             String   @id @default(cuid())
  organisationId String
  ticketId       String?
  kind           String   // triage | reply | embedding | widget
  model          String
  tokensIn       Int
  tokensOut      Int
  latencyMs      Int
  costUsd        Decimal  @db.Decimal(10, 6)
  createdAt      DateTime @default(now())

  @@index([organisationId, createdAt])
  @@index([organisationId, kind, createdAt])
}

model Organisation {
  // additions:
  autoDraftThreshold Float @default(0.75)
  aiDailyTokenCap    Int   @default(500000)
}
```

## AI integration points
- **Triage classifier**: `claude-sonnet-4-6` with forced tool-use returning structured JSON. Non-streaming, capped at ~600 output tokens.
- **Reply drafter**: `claude-sonnet-4-6` streaming via `streamText`. System prompt establishes tone, signature, and "never invent facts" guardrails. RAG retrieval is stubbed here (real retrieval added in Phase 6).

## Environment variables needed
```
ANTHROPIC_API_KEY=
AI_TRIAGE_MODEL=claude-sonnet-4-6
AI_REPLY_MODEL=claude-sonnet-4-6
AI_DEFAULT_AUTO_DRAFT_THRESHOLD=0.75
```

## Definition of done
- [ ] A new ticket has a `TicketTriage` row within 15s of arrival 95% of the time.
- [ ] Routing rule correctly auto-assigns a fixture "billing" ticket.
- [ ] Composer's "Draft (AI)" tab streams text live.
- [ ] `AiUsage` rows accumulate with non-zero token counts.
- [ ] Hitting `aiDailyTokenCap` cleanly suppresses AI jobs (test by setting the cap to `0`).

## Estimated effort
**5 days**

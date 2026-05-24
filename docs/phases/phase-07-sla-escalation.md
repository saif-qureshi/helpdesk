# Phase 7 — SLA management & escalation engine

## Goal
Each workspace defines SLA policies (first-response and resolution times by priority). The system tracks them, warns before breach, alerts on breach, and can auto-escalate (reassign, bump priority, notify channel).

## User stories
- As an admin, I can create SLA policies: e.g., "URGENT: first response in 30 min, resolution in 4 hours".
- As an admin, I can scope a policy to tickets matching a filter (priority, tag, contact attribute).
- As an agent, on each ticket I see a live countdown for first response and resolution.
- As an agent, I get a Slack ping 15 min before a breach.
- As an admin, breached tickets escalate per my rules (reassign to lead, bump priority, post to channel).

## Technical tasks
1. Add `SlaPolicy`, `SlaTarget` (per-priority targets), `SlaClock` (per-ticket per-target state).
2. On ticket create (Phase 2 path), evaluate which `SlaPolicy` matches and write `SlaClock` rows for each target with `dueAt = createdAt + targetMinutes`. Account for business hours (`BusinessHours` model per org, optional in MVP).
3. On first outbound agent message, close the `FIRST_RESPONSE` clock (`closedAt`, `breached = closedAt > dueAt`).
4. On status → `RESOLVED`, close the `RESOLUTION` clock similarly.
5. Add a BullMQ `repeat` job `sla-check` every 60s that:
   - Selects open `SlaClock` rows with `dueAt < now() + 15min` and `warningSent = false` → enqueue warning notifications.
   - Selects `dueAt < now()` and `breached = false` → mark `breached`, apply escalation actions.
6. Add `EscalationRule` model (`onBreach`, `onWarning`) — actions: `reassign`, `bumpPriority`, `notifySlack`, `notifyEmail`.
7. Surface on ticket detail page: an `<SlaBadge clock={...} />` component showing `12m 04s remaining` (red < 10%, yellow < 25%).
8. Add `app/(dashboard)/settings/sla/page.tsx` policy editor.
9. Vitest: clock math, business-hours offset, escalation action evaluator.
10. Integration test: simulate a ticket aging past its first-response SLA → assert breach + escalation action recorded.

## Database schema changes
```prisma
model SlaPolicy {
  id             String   @id @default(cuid())
  organisationId String
  name           String
  filter         Json     // { priority?, tags?, contactDomain? }
  priorityRank   Int      @default(0)   // first matching wins
  enabled        Boolean  @default(true)
  targets        SlaTarget[]
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)

  @@index([organisationId, enabled, priorityRank])
}

model SlaTarget {
  id        String @id @default(cuid())
  policyId  String
  kind      String   // FIRST_RESPONSE | RESOLUTION
  priority  TicketPriority
  minutes   Int
  policy    SlaPolicy @relation(fields: [policyId], references: [id], onDelete: Cascade)

  @@unique([policyId, kind, priority])
}

model SlaClock {
  id        String @id @default(cuid())
  ticketId  String
  policyId  String
  targetKind String  // FIRST_RESPONSE | RESOLUTION
  startedAt DateTime @default(now())
  dueAt     DateTime
  closedAt  DateTime?
  breached  Boolean  @default(false)
  warningSent Boolean @default(false)
  ticket    Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([breached, closedAt, dueAt])
}

model EscalationRule {
  id             String @id @default(cuid())
  organisationId String
  trigger        String  // BREACH | WARNING
  actions        Json    // [{type: reassign, memberId}, {type: notifySlack, channel}]
  enabled        Boolean @default(true)
  @@index([organisationId, enabled])
}

model BusinessHours {
  id             String @id @default(cuid())
  organisationId String @unique
  timezone       String  @default("UTC")
  schedule       Json    // { mon: [["09:00","18:00"]], ... }
}
```

## AI integration points
- None. (Optional future: AI-suggested priority upgrades based on sentiment + breach risk.)

## Environment variables needed
```
SLA_CHECK_INTERVAL_SECONDS=60
```

## Definition of done
- [ ] Creating an URGENT ticket starts a 30-min FIRST_RESPONSE clock visible in UI.
- [ ] Replying within window closes the clock without breach; not replying flips `breached = true` exactly once.
- [ ] Warning ping fires once, never twice (idempotency verified).
- [ ] Escalation action (e.g., reassign) is applied within 60s of breach.

## Estimated effort
**4 days**

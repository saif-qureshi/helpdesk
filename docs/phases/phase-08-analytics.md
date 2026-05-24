# Phase 8 — Analytics & reporting dashboard

## Goal
Workspace admins get a single dashboard showing ticket volume, AI deflection rate, average response & resolution times, agent leaderboard, CSAT, and SLA breach rate — sliceable by time range and team.

## User stories
- As an admin, I see today's, this-week's, and this-month's headline metrics on `/analytics`.
- As an admin, I can drill into "AI deflection" to see how many widget conversations closed without escalation.
- As an admin, I can compare two agents on AHT and CSAT side-by-side.
- As a customer, after a ticket is resolved I receive a 1-click CSAT email; my rating is stored.

## Technical tasks
1. Add `CsatSurvey` model. On ticket `RESOLVED`, enqueue `csat-send` job that emails a 1-click rating link (Postmark template).
2. Public route `app/csat/[token]/page.tsx` accepts `rating` (1–5) + optional comment; writes back to `CsatSurvey`.
3. Build `app/(dashboard)/analytics/page.tsx` server component with date-range param. Query helpers in `lib/analytics/queries.ts`:
   - `getVolume(orgId, range)` — tickets created grouped by day.
   - `getDeflectionRate(orgId, range)` — `resolved widget convos / total widget convos`.
   - `getAvgResponseAndResolution(orgId, range)` — averages from `Message` timeline + `Ticket.closedAt`.
   - `getAgentLeaderboard(orgId, range)` — per-agent volume, AHT, CSAT.
   - `getSlaBreachRate(orgId, range)` — from `SlaClock`.
4. Render with **Recharts** (line for volume, donut for deflection, bar for agent leaderboard, gauge for SLA).
5. Add CSV export buttons (`/api/analytics/export?metric=volume&range=30d`).
6. Add materialised views (Postgres) for heavy queries if `EXPLAIN ANALYZE` shows > 200ms on realistic data; refresh via cron BullMQ.
7. Vitest: math for AHT, deflection, breach rate using fixture datasets.

## Database schema changes
```prisma
model CsatSurvey {
  id        String @id @default(cuid())
  ticketId  String @unique
  token     String @unique
  rating    Int?   // 1..5
  comment   String?
  sentAt    DateTime @default(now())
  respondedAt DateTime?
  ticket    Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}
```

## AI integration points
- None (optional: AI summary of weekly trends — defer).

## Environment variables needed
```
CSAT_TOKEN_SECRET=
```

## Definition of done
- [ ] Resolving a ticket sends a CSAT email; clicking a rating records it.
- [ ] All five headline metrics render with correct values on a seeded fixture dataset.
- [ ] CSV export produces a file matching the on-screen chart.
- [ ] Page loads under 1s on 10k-ticket dataset.

## Estimated effort
**4 days**

# Phase 3 — Agent workspace (ticket queue & detail view)

## Goal
An agent can run their full day in-app: triage the queue, open a ticket, reply to the customer (email out via Postmark), leave internal notes, reassign, and change status.

## User stories
- As an agent, I see "My Queue", "Unassigned", and "All Open" tabs.
- As an agent, I can filter by status, priority, assignee, and free-text search.
- As an agent, I can open a ticket, see the full conversation, and write a reply using a rich-text editor.
- As an agent, I can leave an internal note that the customer never sees.
- As an agent, I can change status, priority, and assignee with a single click.
- As an agent, I see who else is viewing the ticket in realtime (presence).
- As an agent, when I send a reply, the customer receives an email and the thread stays intact.

## Technical tasks
1. Add `app/(dashboard)/tickets/page.tsx` tabs: `?view=mine|unassigned|all`. Server component reads `view` and `requireOrg()` then runs the appropriate Prisma query.
2. Add filter bar: shadcn `Select` for status/priority, `Combobox` for assignee, `Input` for `q` (Postgres `ILIKE` on `subject` and `messages.bodyText` joined).
3. Add saved-views persistence (Phase 3.5 optional): a `SavedView` table keyed by `memberId`.
4. Build ticket detail at `app/(dashboard)/tickets/[id]/page.tsx`:
   - Left: message timeline.
   - Right: properties panel (status, priority, assignee, contact info, tags).
   - Bottom: tabbed composer (Reply | Internal note).
5. Use **TipTap** for the rich-text composer. Persist drafts to `localStorage` keyed by ticket id.
6. Add Server Actions:
   - `replyToTicket(ticketId, html, text, attachments)` — creates `Message(OUTBOUND, EMAIL)`, calls Postmark `sendEmail` (or `sendEmailWithTemplate`) with `In-Reply-To` and `References` headers stitched from the latest inbound `emailMessageId`, then updates `Ticket.updatedAt`.
   - `addInternalNote(ticketId, html, text)` — `Message(INTERNAL, EMAIL)`.
   - `updateTicket(ticketId, { status?, priority?, assigneeId? })` — writes a `SYSTEM` message describing the change (audit trail).
7. Implement presence with **Pusher Channels** (or `partykit`): on ticket page mount, subscribe to `presence-ticket-<id>` and render avatars.
8. Add a keyboard-shortcut layer (using `cmdk` for command palette): `j/k` to move between tickets, `r` to focus reply, `n` to focus note, `1-4` to set status, `cmd+enter` to send.
9. Add toast notifications (`sonner`) for success/failure of every server action.
10. Add Postmark outbound webhook → `app/api/webhooks/postmark/outbound/route.ts` to handle bounces, set `Message.deliveryStatus`.
11. Vitest: business logic for `stitchEmailHeaders(thread)` and the role guard on `replyToTicket` (a `VIEWER` cannot reply).
12. Playwright: login → open queue → open ticket → reply → assert new message in timeline.

## Database schema changes
```prisma
model Message {
  // additions:
  deliveryStatus String?   // delivered | bounced | complained | null
  deliveryError  String?
}

model Ticket {
  // additions:
  tags String[] @default([])
}

model SavedView {
  id        String @id @default(cuid())
  memberId  String
  name      String
  query     Json     // { status, priority, assigneeId, q, view }
  createdAt DateTime @default(now())

  @@index([memberId])
}
```

## AI integration points
- None directly. (Phase 4 will surface AI-drafted replies inside this same composer.)

## Environment variables needed
```
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
POSTMARK_OUTBOUND_STREAM=outbound
```

## Definition of done
- [ ] Agent can complete a full reply round-trip with a real email account.
- [ ] Threading holds across at least 3 back-and-forth exchanges.
- [ ] Status, priority, assignee changes appear in the timeline.
- [ ] Internal notes never appear in outbound emails (verified by an explicit test).
- [ ] Keyboard shortcuts work; command palette opens with `cmd+k`.
- [ ] Bounce webhook flips `Message.deliveryStatus` and shows a warning in the UI.

## Estimated effort
**6 days**

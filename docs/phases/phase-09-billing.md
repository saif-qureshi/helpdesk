# Phase 9 — Billing & subscription management

## Goal
Customers self-serve subscribing to Starter / Growth / Enterprise plans with Stripe Checkout, get metered AI usage, and can manage their plan via the Stripe Customer Portal. Plan limits are enforced in-app.

## User stories
- As a workspace owner, I can pick a plan at `/billing` and complete Stripe Checkout.
- As a workspace owner, I can open the Stripe Customer Portal to change plan, payment method, or cancel.
- As a workspace owner, I see current usage (tickets, AI tokens, members) vs. plan limits.
- As a workspace owner, I am warned when I am at 80% of any limit; I am blocked from new AI calls when over.
- As an admin, exceeding a metered cap creates a Stripe usage record so the customer is billed for overage.

## Technical tasks
1. Stripe dashboard: create Products `Starter`, `Growth`, `Enterprise` each with a monthly Price. Create a metered Price `AI Tokens (per 1k)` attached to all plans.
2. Add Prisma models: `Subscription`, `PlanFeature` (in-code constant table, not DB).
3. Build `app/(dashboard)/billing/page.tsx`:
   - Plan cards with "Subscribe" CTAs that POST to `/api/billing/checkout` returning a Stripe Checkout URL.
   - Usage cards (members, tickets-this-month, AI tokens-this-month).
   - "Manage billing" button → `/api/billing/portal` returning a Stripe Customer Portal URL.
4. Implement `/api/webhooks/stripe/route.ts` verifying signatures with `stripe.webhooks.constructEvent`. Handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Update `Subscription` rows accordingly.
5. Add `lib/billing/limits.ts` exporting `PLAN_LIMITS` (`{ starter: { members: 3, aiTokensPerMonth: 100_000, ... }, growth: ..., enterprise: ... }`) and `assertWithinPlan(orgId, feature)`.
6. Call `assertWithinPlan` in: invite-member action, AI triage worker (skip with notice on cap), widget chat handler.
7. Add a daily cron BullMQ job `usage-report` that sums `AiUsage.tokensOut + tokensIn` for the day and pushes a Stripe usage record for the metered price.
8. Add a banner on every dashboard page when subscription is `past_due` or `canceled`.
9. Vitest: `assertWithinPlan` matrix; webhook handler with fixture Stripe events.

## Database schema changes
```prisma
model Subscription {
  id                 String @id @default(cuid())
  organisationId     String @unique
  stripeCustomerId   String @unique
  stripeSubscriptionId String? @unique
  plan               String  // starter | growth | enterprise
  status             String  // trialing | active | past_due | canceled | incomplete
  currentPeriodEnd   DateTime?
  cancelAtPeriodEnd  Boolean @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  organisation       Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)
}
```

## AI integration points
- AI cost is reported back through `AiUsage` (added in Phase 4) → daily usage records to Stripe.

## Environment variables needed
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_GROWTH=price_...
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_METERED_PRICE_AI_TOKENS=price_...
```

## Definition of done
- [ ] Subscribing to a plan completes Checkout and the `Subscription` row is written via webhook.
- [ ] Hitting member limit on `Starter` shows an upgrade prompt and blocks invites server-side.
- [ ] AI cap blocks AI jobs and surfaces a clear in-app message.
- [ ] A run of the daily usage job creates a Stripe `usage_record` matching observed token count.
- [ ] Cancel → webhook → banner appears within seconds; access downgrades at period end.

## Estimated effort
**5 days**

# resolv.ai — Phased Build Plan

AI-native unified inbox for D2C brands. Leads with WhatsApp Cloud API (direct with Meta), expanding to Instagram / Messenger / email / web chat / SMS / Telegram through a single `IChannelProvider` abstraction. Built on Next.js 14 + Prisma 7 + Postgres + BullMQ + Claude.

Strategic positioning (Phase 1.5 onward): not a generic helpdesk, not a generic unified inbox. The wedge is **AI auto-resolves WhatsApp customer questions from store data** (Shopify first) — orders, returns, products, addresses. Wati/Respond.io give brands an inbox to type replies into; we answer for them.

One file per phase. Read top-to-bottom; later phases assume earlier infra.

## Timeline

| Phase | Name | Outcome | Est. Days | Status |
|------:|------|---------|----------:|--------|
| [0](./phase-00-scaffold.md) | Scaffold & infrastructure | Deployable Next.js app with DB, Redis, worker, CI all green | 3 | ✅ Done |
| [1](./phase-01-auth-onboarding.md) | Multi-tenant auth & onboarding | A user can sign up, create an org, invite teammates, land on a dashboard | 4 | ✅ Done |
| 1.5 | Custom auth (drop Clerk) | Email/password + Google OAuth, opaque DB sessions, 24h sliding window | 3 | ✅ Done |
| [2](./phase-02-channels-ingestion.md) | Channels & conversation ingestion | WhatsApp + web chat + email landing in a unified inbox via `IChannelProvider` | 12 | ⏳ Next |
| [3](./phase-03-agent-workspace.md) | Agent workspace | Agents triage, reply, and close tickets end-to-end | 6 | |
| [4](./phase-04-ai-triage.md) | AI triage engine | Every new ticket gets classified, routed, and (optionally) auto-drafted | 5 | |
| [5](./phase-05-ai-self-service.md) | AI self-service widget | Embeddable chat widget that resolves or escalates | 6 | |
| [6](./phase-06-knowledge-base.md) | Knowledge base + RAG loop | KB articles power AI replies; resolved tickets become draft articles | 6 | |
| [7](./phase-07-sla-escalation.md) | SLA & escalation | Workspaces define SLAs; breaches alert and escalate | 4 | |
| [8](./phase-08-analytics.md) | Analytics & reporting | Admins see volume, deflection, AHT, CSAT, agent perf | 4 | |
| [9](./phase-09-billing.md) | Billing & subscriptions | Stripe plans + metered AI usage + customer portal | 5 | |
| [10](./phase-10-integrations.md) | Integrations layer | Webhooks, Slack, Jira, public REST API | 6 | |
| | **Total** | **MVP → scalable product** | **~54 days** | |

**Critical-path notes:**
- Phases 0–4 form the **shippable MVP** (~23 days). Sell from this.
- Phase 5 is the AI differentiator — do not skip even for design partners.
- Phase 6 (RAG) silently multiplies the quality of Phases 4 and 5; build it before scaling sales.
- Phase 9 (billing) can ship in parallel with Phase 8 because they touch disjoint surfaces.

## Repo layout (established in Phase 0, referenced throughout)

```
helpdesk/
├── app/
│   ├── (auth)/                  # sign-in / sign-up / forgot / reset
│   ├── (marketing)/             # Public landing, /widget loader
│   ├── (dashboard)/             # Authed agent UI
│   ├── api/                     # Next.js route handlers (incl. /api/auth/*)
│   └── layout.tsx
├── lib/
│   ├── infra/                   # Prisma client, Redis, queue, tenancy guard
│   ├── auth/                    # session cookies, getCurrentUser, tenant ctx
│   ├── core/                    # interfaces (repositories, channels, auth)
│   ├── repositories/            # Prisma-backed implementations
│   ├── services/                # business logic (auth, onboarding, conversation)
│   ├── providers/channels/      # IChannelProvider implementations (Phase 2)
│   ├── ai/                      # Claude client + prompts (Phase 4)
│   └── rag/                     # Embeddings + pgvector retrieval (Phase 6)
├── workers/
│   ├── index.ts                 # BullMQ worker entrypoint (Railway)
│   └── processors/
├── prisma/
│   └── schema.prisma
├── packages/widget/             # Embeddable JS widget (Phase 5)
├── tests/
└── .env.example
```

## Cross-cutting requirements (ongoing — not a phase)

- **Tenancy guard**: Prisma `$extends` client extension from Phase 0 is the immune system. `TENANT_SCOPED_MODELS` is auto-generated from the schema by `scripts/gen-tenant-models.ts` — every new model with `organisationId` is picked up automatically. `SCOPE_KEYS = ["organisationId", "userId"]`.
- **Rate limits**: every public-facing route (`/api/widget/*`, `/api/webhooks/*` from untrusted senders, `/{orgSlug}/contact`, `/api/v1/*`) uses `@upstash/ratelimit` with sensible defaults — never ship a public route without one.
- **Streaming**: any user-facing AI response uses `streamText` via the Vercel AI SDK. Background AI (triage, classification, suggestions) does not stream.
- **Vector RAG**: never call the reply drafter or widget AI without first calling `retrieveContext()` once Phase 6 lands. Audited via a wrapper `draftWithRag()` in `lib/ai/`.
- **TypeScript strict**: `strict + noUncheckedIndexedAccess` from day one; CI rejects PRs that loosen these.
- **Testing baseline per phase**: at least one unit test per pure-logic helper added (classification, SLA math, RAG retrieval, billing limits) and one integration test per new API route. Playwright smoke for any new dashboard surface.
- **Observability**: add `lib/log.ts` (pino) and log structured JSON with `organisationId`, `userId`, `requestId`. Ship logs to Logtail/Axiom from day one — without it Phase 4+ debugging is impossible.

## Suggested order of risk-reduction spikes (before Phase 4)

If any of these are unfamiliar, do a 1-day spike before committing to the phase:
1. Postmark inbound webhook + threading (Phase 2).
2. BullMQ on Railway with a worker service (Phase 0).
3. pgvector + Prisma `Unsupported` type + raw SQL index (Phase 6).
4. Vercel AI SDK `streamText` from a Next.js Route Handler (Phase 4).
5. Stripe metered billing with usage records (Phase 9).

Each spike is throwaway code in a `/spikes` branch; promote only what you understand.

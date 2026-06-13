# Helpdesk SaaS

AI-driven, multi-tenant helpdesk. Backend on Next.js 14 (App Router) + Prisma 7 +
PostgreSQL/pgvector + Redis/BullMQ + Claude. Build is phased — see
[`docs/phases/`](./docs/phases/).

> Frontend/UI is owned separately. This repo currently contains the backend:
> API route handlers, Prisma schema, queue workers, and supporting services.

## Architecture

Layered, dependency-inverted (SOLID):

| Layer | Path | Responsibility |
|-------|------|----------------|
| Core | `lib/core/` | Domain types, interfaces (ports), error hierarchy. No external deps. |
| Infra | `lib/infra/` | Concrete singletons: Prisma client, Redis, BullMQ queue factory. |
| Providers | `lib/providers/` | Adapters for external services behind core interfaces *(added in later phases)*. |
| Repositories | `lib/repositories/` | Data access wrapping Prisma *(added in later phases)*. |
| Services | `lib/services/`, `lib/health/` | Business logic; depends on interfaces, injected via constructor. |
| Composition root | `lib/container.ts` | Wires concrete implementations to services. |
| Worker | `workers/` | BullMQ worker bootstrap + processors. |

Route handlers and worker processors stay thin: parse input → call a service →
format output.

## Prerequisites

- Node 20+, pnpm 10+
- PostgreSQL with the `vector` extension (`CREATE EXTENSION vector;`)
- Redis

## Quickstart

```bash
pnpm install
cp .env.example .env        # then fill in DATABASE_URL, REDIS_URL, …
pnpm check:env              # validate env vars
pnpm db:generate            # generate the Prisma client
pnpm db:push                # apply schema to your database
pnpm dev                    # Next.js app  (http://localhost:3000)
pnpm worker                 # BullMQ worker (separate terminal)
```

Verify the stack is wired up:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","checks":{"db":{...},"redis":{...},"worker":{...}}}
```

`worker` reports `error` until `pnpm worker` is running and has written its first
heartbeat.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Run the Next.js app |
| `pnpm worker` | Run the BullMQ worker |
| `pnpm build` | `prisma generate` + `next build` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Run Vitest once |
| `pnpm lint` | ESLint via `next lint` |
| `pnpm db:generate` / `db:push` / `db:migrate` | Prisma client / schema sync / migrations |
| `pnpm check:env` | Validate environment variables |

## Deployment

- **App** → Vercel. Build command `prisma generate && next build`.
- **Worker** → Railway service, start command `pnpm worker`, healthcheck `/healthz`.
- **Postgres + Redis** → Railway.

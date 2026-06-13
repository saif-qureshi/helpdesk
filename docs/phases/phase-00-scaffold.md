# Phase 0 — Project scaffold & infrastructure

> **Status: ✅ Completed** — backend scaffold, infra libs, worker, health endpoint, CI, and tests built and locally verified (typecheck, lint, test, build all green). Live `/api/health` 200, `prisma migrate` on Railway, and Vercel/Railway deploys still pending real infra. Note: stack uses **Prisma 7** (driver adapter; tenancy guard in Phase 1 must use a `$extends` client extension, not `$use` middleware).

## Goal
A `pnpm dev` runs a Next.js app that talks to Postgres, Redis, and a BullMQ worker; the same stack is deployed to Vercel + Railway with CI green.

## User stories
- As the founder, I can run the whole stack locally with one command.
- As the founder, I can push to `main` and see the change live on Vercel within 5 minutes.
- As the founder, I can hit `/api/health` in prod and see `{ db: "ok", redis: "ok", worker: "ok" }`.

## Technical tasks
1. `pnpm create next-app@latest helpdesk --typescript --app --tailwind --eslint --src-dir=false --import-alias "@/*"`.
2. Enable `"strict": true`, `"noUncheckedIndexedAccess": true` in `tsconfig.json`.
3. Install core deps: `prisma @prisma/client ioredis bullmq zod @clerk/nextjs @upstash/ratelimit @anthropic-ai/sdk ai`.
4. `pnpm dlx shadcn-ui@latest init` (slate, CSS variables). Add `button card input dialog sheet toast dropdown-menu table badge separator`.
5. `pnpm dlx prisma init` → set datasource provider `postgresql`, enable `previewFeatures = ["postgresqlExtensions"]`, declare `extensions = [pgvector(map: "vector")]`.
6. Provision Railway: Postgres (with `CREATE EXTENSION vector;` run via `prisma db execute --stdin`), Redis, and a service for the worker.
7. Create `lib/db.ts` exporting a global-cached `PrismaClient` (avoid hot-reload connection storms).
8. Create `lib/redis.ts` exporting a singleton `Redis` connection with `maxRetriesPerRequest: null` (required by BullMQ).
9. Create `lib/queue.ts` with a `createQueue<T>(name)` factory and a registry of named queues: `ticket-ingest`, `ai-triage`, `ai-reply`, `sla-check`, `webhook-deliver`.
10. Create `workers/index.ts` that boots all processors. Add a `package.json` script `"worker": "tsx workers/index.ts"`.
11. Add `app/api/health/route.ts` performing `SELECT 1` on Postgres, `PING` on Redis, and reading a heartbeat key the worker writes every 30s.
12. Add Railway worker service: command `pnpm worker`, healthcheck on a tiny HTTP server inside `workers/index.ts` exposing `/healthz`.
13. Configure GitHub Actions (`.github/workflows/ci.yml`): install, typecheck, lint, `prisma validate`, `vitest run`.
14. Add `vitest` + `@testing-library/react` + a single smoke test importing the Prisma client without crashing.
15. Add `.env.example` with every var. Add a `pnpm check:env` script using `zod` to validate `process.env` at boot (`lib/env.ts`).
16. Connect Vercel project to the repo; set env vars; set the Vercel build command to `prisma generate && next build`.
17. Write `README.md` Quickstart: clone → `pnpm i` → fill `.env` → `pnpm db:push` → `pnpm dev` + `pnpm worker`.

## Database schema changes
- None yet — only the `vector` extension is enabled. Schema starts empty.

## AI integration points
- None.

## Environment variables needed
```
DATABASE_URL=
DIRECT_URL=                # for prisma migrate (Railway pooler quirk)
REDIS_URL=
NEXT_PUBLIC_APP_URL=
WORKER_HEARTBEAT_KEY=helpdesk:worker:heartbeat
```

## Definition of done
- [ ] `pnpm dev` + `pnpm worker` boot with zero errors.
- [ ] `GET /api/health` returns `200` with all three services `"ok"`.
- [ ] CI passes on a fresh PR.
- [ ] Vercel deploy of `main` is green and `/api/health` is green in prod.
- [ ] `prisma migrate dev` works against Railway Postgres.

## Estimated effort
**3 days**

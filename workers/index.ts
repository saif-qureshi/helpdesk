import "dotenv/config";

import { Worker } from "bullmq";
import { env } from "@/lib/env";
import { redis } from "@/lib/infra/redis";
import { processors } from "@/workers/processors";
import { startHeartbeat } from "@/workers/heartbeat";
import { startHealthServer } from "@/workers/health-server";

/**
 * Worker entrypoint (run on Railway via `pnpm worker`).
 *
 * Boots one BullMQ Worker per registered processor, emits a liveness heartbeat,
 * and serves `/healthz`. Bootstrap logic only — job behaviour lives in
 * `workers/processors/*`.
 */
function main(): void {
  const log = (...args: unknown[]) => console.log("[worker]", ...args);

  const workers = processors.map((reg) =>
    new Worker(reg.queue, reg.process, {
      connection: redis,
      concurrency: reg.concurrency ?? 5,
    }),
  );

  for (const w of workers) {
    w.on("failed", (job, err) =>
      console.error("[worker]", w.name, "job failed", job?.id, err),
    );
    w.on("error", (err) => console.error("[worker]", w.name, "error", err));
  }

  const stopHeartbeat = startHeartbeat(redis, env.WORKER_HEARTBEAT_KEY);
  const server = startHealthServer(env.WORKER_PORT);

  log(
    `up — ${workers.length} processor(s), /healthz on :${env.WORKER_PORT}`,
  );

  const shutdown = async (signal: string) => {
    log(`received ${signal}, shutting down…`);
    stopHeartbeat();
    server.close();
    await Promise.allSettled(workers.map((w) => w.close()));
    await redis.quit().catch(() => undefined);
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main();

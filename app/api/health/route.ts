import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/infra/db";
import { redis } from "@/lib/infra/redis";
import { HealthService } from "@/lib/health/health.service";
import { PostgresHealthIndicator } from "@/lib/health/indicators/postgres.indicator";
import { RedisHealthIndicator } from "@/lib/health/indicators/redis.indicator";
import { WorkerHeartbeatIndicator } from "@/lib/health/indicators/worker-heartbeat.indicator";

// Prisma + ioredis require the Node.js runtime, and health must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const healthService = new HealthService([
  new PostgresHealthIndicator(prisma),
  new RedisHealthIndicator(redis),
  new WorkerHeartbeatIndicator(redis, env.WORKER_HEARTBEAT_KEY),
]);

export async function GET() {
  const report = await healthService.check();
  return NextResponse.json(report, {
    status: report.status === "ok" ? 200 : 503,
  });
}

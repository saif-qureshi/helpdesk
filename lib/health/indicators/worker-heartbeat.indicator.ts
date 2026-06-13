import type { Redis } from "ioredis";
import type { HealthIndicator, IndicatorResult } from "@/lib/core/health";

/**
 * Confirms the BullMQ worker is alive by reading a heartbeat key it refreshes
 * every {@link WORKER_HEARTBEAT_INTERVAL_MS}. The value is epoch millis; the
 * check fails if it is missing or older than `staleAfterMs`.
 */
export class WorkerHeartbeatIndicator implements HealthIndicator {
  readonly name = "worker";

  constructor(
    private readonly redis: Redis,
    private readonly key: string,
    /** Allow ~3 missed beats before declaring the worker down. */
    private readonly staleAfterMs = 90_000,
  ) {}

  async check(): Promise<IndicatorResult> {
    try {
      const raw = await this.redis.get(this.key);
      if (raw === null) {
        return { status: "error", detail: "no heartbeat recorded" };
      }
      const beatAt = Number(raw);
      if (!Number.isFinite(beatAt)) {
        return { status: "error", detail: `invalid heartbeat value: ${raw}` };
      }
      const age = Date.now() - beatAt;
      if (age > this.staleAfterMs) {
        return { status: "error", detail: `stale heartbeat (${age}ms old)` };
      }
      return { status: "ok", detail: `${age}ms since last beat` };
    } catch (err) {
      return {
        status: "error",
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

/** How often the worker should refresh its heartbeat key. */
export const WORKER_HEARTBEAT_INTERVAL_MS = 30_000;

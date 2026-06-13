import type { Redis } from "ioredis";
import type { HealthIndicator, IndicatorResult } from "@/lib/core/health";

/** Verifies Redis connectivity with `PING`. */
export class RedisHealthIndicator implements HealthIndicator {
  readonly name = "redis";

  constructor(private readonly redis: Redis) {}

  async check(): Promise<IndicatorResult> {
    const start = Date.now();
    try {
      const pong = await this.redis.ping();
      if (pong !== "PONG") {
        return {
          status: "error",
          detail: `unexpected PING reply: ${pong}`,
          latencyMs: Date.now() - start,
        };
      }
      return { status: "ok", latencyMs: Date.now() - start };
    } catch (err) {
      return {
        status: "error",
        detail: err instanceof Error ? err.message : String(err),
        latencyMs: Date.now() - start,
      };
    }
  }
}

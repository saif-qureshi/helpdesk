import type { Redis } from "ioredis";
import { WORKER_HEARTBEAT_INTERVAL_MS } from "@/lib/health/indicators/worker-heartbeat.indicator";

/**
 * Periodically writes the current time to the heartbeat key so the health
 * endpoint can tell the worker is alive. Returns a stop function.
 */
export function startHeartbeat(redis: Redis, key: string): () => void {
  const beat = () => {
    void redis.set(key, Date.now().toString());
  };
  beat();
  const timer = setInterval(beat, WORKER_HEARTBEAT_INTERVAL_MS);
  // Don't keep the event loop alive solely for the heartbeat.
  timer.unref?.();
  return () => clearInterval(timer);
}

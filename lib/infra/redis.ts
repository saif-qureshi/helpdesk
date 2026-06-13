import { Redis, type RedisOptions } from "ioredis";
import { env } from "@/lib/env";

/**
 * ioredis singleton used for BullMQ and ad-hoc commands (e.g. the worker
 * heartbeat). `maxRetriesPerRequest: null` is required by BullMQ's blocking
 * commands. Cached on `globalThis` to survive Next.js hot-reloads.
 */
const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis: Redis =
  globalForRedis.redis ?? new Redis(env.REDIS_URL, redisOptions);

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

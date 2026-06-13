import { Queue, type QueueOptions } from "bullmq";
import { redis } from "@/lib/infra/redis";

/**
 * Central registry of BullMQ queues. Adding a queue is a one-line change here
 * plus a payload entry below; producers and the worker both import from this
 * single source so names never drift.
 */
export const QUEUE_NAMES = {
  ticketIngest: "ticket-ingest",
  aiTriage: "ai-triage",
  aiReply: "ai-reply",
  slaCheck: "sla-check",
  webhookDeliver: "webhook-deliver",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/**
 * Typed payload for each queue. Later phases flesh these out; the map keeps
 * producers and processors in sync at compile time.
 */
export interface JobPayloads {
  "ticket-ingest": { raw: unknown };
  "ai-triage": { ticketId: string };
  "ai-reply": { ticketId: string };
  "sla-check": Record<string, never>;
  "webhook-deliver": { webhookId: string; event: string; payload: unknown };
}

const defaultJobOptions: QueueOptions["defaultJobOptions"] = {
  attempts: 5,
  backoff: { type: "exponential", delay: 1_000 },
  removeOnComplete: { age: 24 * 3600, count: 1_000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

const globalForQueues = globalThis as unknown as {
  queues: Map<QueueName, Queue> | undefined;
};

const queues: Map<QueueName, Queue> =
  globalForQueues.queues ?? new Map<QueueName, Queue>();
globalForQueues.queues = queues;

/**
 * Get (or lazily create) a typed queue. Instances are cached so we never open
 * duplicate connections for the same queue.
 */
export function createQueue<N extends QueueName>(
  name: N,
): Queue<JobPayloads[N]> {
  const existing = queues.get(name);
  if (existing) return existing as Queue<JobPayloads[N]>;

  const queue = new Queue<JobPayloads[N]>(name, {
    connection: redis,
    defaultJobOptions,
  });
  queues.set(name, queue as Queue);
  return queue;
}

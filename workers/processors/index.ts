import type { Processor } from "bullmq";
import type { JobPayloads, QueueName } from "@/lib/infra/queue";

/**
 * A processor binds a queue name to its job handler. The worker bootstrap reads
 * this list and spins up one BullMQ Worker per registration — adding a job
 * processor means appending here, with no change to the bootstrap (Open/Closed).
 */
export interface ProcessorRegistration<N extends QueueName = QueueName> {
  queue: N;
  process: Processor<JobPayloads[N]>;
  /** Max jobs handled concurrently by this worker. */
  concurrency?: number;
}

/**
 * Registered processors. Empty in Phase 0 — ticket ingestion (Phase 2), AI
 * triage/reply (Phase 4), SLA checks (Phase 7) and webhook delivery (Phase 10)
 * register their handlers here.
 */
export const processors: ProcessorRegistration[] = [];

/**
 * Health-check contracts (Phase 0).
 *
 * A {@link HealthIndicator} checks one dependency. The aggregating service
 * depends only on this interface, so new dependencies can be health-checked by
 * adding an indicator — no change to the service (Open/Closed Principle).
 */

export type HealthState = "ok" | "error";

export interface IndicatorResult {
  status: HealthState;
  /** Optional human-readable detail, e.g. an error message or latency. */
  detail?: string;
  /** Round-trip time of the check, in milliseconds. */
  latencyMs?: number;
}

export interface HealthIndicator {
  /** Stable key used in the aggregated report, e.g. "db", "redis", "worker". */
  readonly name: string;
  check(): Promise<IndicatorResult>;
}

export interface HealthReport {
  status: HealthState;
  checks: Record<string, IndicatorResult>;
}

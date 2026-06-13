import type { HealthIndicator, IndicatorResult } from "@/lib/core/health";

/**
 * The narrow slice of the Prisma client this indicator needs (Interface
 * Segregation) — just enough to run a probe query. Satisfied by both the base
 * and the tenancy-extended client.
 */
export interface SqlHealthProbe {
  $queryRaw<T = unknown>(
    query: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T>;
}

/** Verifies Postgres connectivity with a trivial `SELECT 1`. */
export class PostgresHealthIndicator implements HealthIndicator {
  readonly name = "db";

  constructor(private readonly db: SqlHealthProbe) {}

  async check(): Promise<IndicatorResult> {
    const start = Date.now();
    try {
      await this.db.$queryRaw`SELECT 1`;
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

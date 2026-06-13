import type {
  HealthIndicator,
  HealthReport,
  IndicatorResult,
} from "@/lib/core/health";

/**
 * Aggregates a set of {@link HealthIndicator}s into one report. Depends only on
 * the indicator interface, so new dependencies are added by injecting more
 * indicators — this class never changes (Open/Closed, Dependency Inversion).
 */
export class HealthService {
  constructor(private readonly indicators: readonly HealthIndicator[]) {}

  async check(): Promise<HealthReport> {
    const results = await Promise.all(
      this.indicators.map(
        async (indicator): Promise<[string, IndicatorResult]> => [
          indicator.name,
          await indicator.check(),
        ],
      ),
    );

    const checks = Object.fromEntries(results);
    const status = results.every(([, r]) => r.status === "ok")
      ? "ok"
      : "error";

    return { status, checks };
  }
}

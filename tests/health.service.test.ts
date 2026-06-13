import { describe, it, expect } from "vitest";
import { HealthService } from "@/lib/health/health.service";
import type { HealthIndicator, IndicatorResult } from "@/lib/core/health";

/** Test double — lets us drive HealthService without real infrastructure. */
class StubIndicator implements HealthIndicator {
  constructor(
    readonly name: string,
    private readonly result: IndicatorResult,
  ) {}
  check(): Promise<IndicatorResult> {
    return Promise.resolve(this.result);
  }
}

describe("HealthService", () => {
  it("reports ok and includes every indicator when all pass", async () => {
    const service = new HealthService([
      new StubIndicator("db", { status: "ok", latencyMs: 1 }),
      new StubIndicator("redis", { status: "ok", latencyMs: 2 }),
    ]);

    const report = await service.check();

    expect(report.status).toBe("ok");
    expect(Object.keys(report.checks)).toEqual(["db", "redis"]);
    expect(report.checks.db?.status).toBe("ok");
  });

  it("reports error when any indicator fails", async () => {
    const service = new HealthService([
      new StubIndicator("db", { status: "ok" }),
      new StubIndicator("redis", { status: "error", detail: "down" }),
    ]);

    const report = await service.check();

    expect(report.status).toBe("error");
    expect(report.checks.redis?.detail).toBe("down");
  });

  it("treats an empty indicator set as healthy", async () => {
    const report = await new HealthService([]).check();
    expect(report.status).toBe("ok");
    expect(report.checks).toEqual({});
  });
});

/**
 * Tenancy guard (defense in depth).
 *
 * A Prisma client extension that throws if a query against a tenant-scoped model
 * forgets to filter/insert by `organisationId`. Repositories are the primary
 * scoping mechanism; this guard catches mistakes before they leak across
 * tenants. Prisma 7 removed `$use` middleware, so this is implemented as a
 * `$extends` query interceptor (wired in lib/infra/db.ts).
 */

/**
 * Models that carry an `organisationId` and must always be scoped. Derived from
 * the Prisma schema by scripts/gen-tenant-models.ts (runs in `pnpm db:generate`)
 * so the set can never drift as new models are added. `Organisation` is the
 * tenant root (scoped by its own id) and is correctly excluded.
 */
export { TENANT_SCOPED_MODELS } from "@/lib/infra/tenant-models.generated";
import { TENANT_SCOPED_MODELS } from "@/lib/infra/tenant-models.generated";

export class TenancyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenancyViolationError";
  }
}

/** Operations whose `where` must constrain `organisationId`. */
const WHERE_SCOPED_OPS = new Set<string>([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "updateMany",
  "deleteMany",
  "count",
  "aggregate",
  "groupBy",
]);

/** Operations whose `data` must set `organisationId`. */
const DATA_SCOPED_OPS = new Set<string>([
  "create",
  "createMany",
  "createManyAndReturn",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// A read is scoped if it filters by the org, or by a single user (clerkUserId) —
// the latter can't leak across tenants (it returns only that user's rows).
const SCOPE_KEYS = ["organisationId", "clerkUserId"] as const;

function whereHasScope(where: unknown): boolean {
  return (
    isRecord(where) && SCOPE_KEYS.some((key) => where[key] !== undefined)
  );
}

function dataHasOrg(data: unknown): boolean {
  if (Array.isArray(data)) {
    return data.every((d) => isRecord(d) && d["organisationId"] !== undefined);
  }
  return isRecord(data) && data["organisationId"] !== undefined;
}

/**
 * Throws {@link TenancyViolationError} if a tenant-scoped query is missing its
 * `organisationId` constraint. No-op for non-scoped models.
 *
 * Unique-selector operations (`findUnique`, `update`, `delete`, …) are not
 * enforced here: their `where` only accepts unique fields, so scoping is left to
 * the repositories that issue them.
 */
export function assertTenantScoped(
  model: string | undefined,
  operation: string,
  args: unknown,
): void {
  if (!model || !TENANT_SCOPED_MODELS.has(model)) return;

  const a = isRecord(args) ? args : {};

  if (WHERE_SCOPED_OPS.has(operation) && !whereHasScope(a["where"])) {
    throw new TenancyViolationError(
      `${model}.${operation} must filter by organisationId or clerkUserId`,
    );
  }

  if (DATA_SCOPED_OPS.has(operation) && !dataHasOrg(a["data"])) {
    throw new TenancyViolationError(
      `${model}.${operation} must set organisationId`,
    );
  }

  if (operation === "upsert" && !dataHasOrg(a["create"])) {
    throw new TenancyViolationError(
      `${model}.upsert must set organisationId in create`,
    );
  }
}

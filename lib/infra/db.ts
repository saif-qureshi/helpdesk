import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { assertTenantScoped } from "@/lib/infra/tenancy";

/**
 * Prisma client singleton.
 *
 * Prisma 7's `prisma-client` generator ships a query compiler with no embedded
 * engine, so the client connects through a driver adapter (node-postgres here).
 * The tenancy guard is applied as a `$extends` query interceptor. Cached on
 * `globalThis` in development so Next.js hot-reloads reuse one connection pool.
 */
function createPrisma() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  const base = new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return base.$extends({
    name: "tenancy-guard",
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          assertTenantScoped(model, operation, args);
          return query(args);
        },
      },
    },
  });
}

/** The application database client, with the tenancy guard applied. */
export type Db = ReturnType<typeof createPrisma>;

const globalForPrisma = globalThis as unknown as {
  prisma: Db | undefined;
};

export const prisma: Db = globalForPrisma.prisma ?? createPrisma();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

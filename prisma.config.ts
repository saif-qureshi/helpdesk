import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Used by the Prisma CLI (migrate / db push). Prefer a direct, non-pooled
    // connection here — Railway's pooler can break migrations. The app runtime
    // connects separately through the node-postgres adapter in lib/infra/db.ts
    // using the (possibly pooled) DATABASE_URL.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});

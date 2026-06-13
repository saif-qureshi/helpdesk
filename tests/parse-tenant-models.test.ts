import { describe, it, expect } from "vitest";
import { parseTenantScopedModels } from "@/lib/infra/parse-tenant-models";

const schema = `
model Organisation {
  id         String @id @default(cuid())
  clerkOrgId String @unique
  members    Member[]
}

model Member {
  id             String @id @default(cuid())
  organisationId String
  organisation   Organisation @relation(fields: [organisationId], references: [id])
}

model Ticket {
  id             String @id @default(cuid())
  organisationId String
}
`;

describe("parseTenantScopedModels", () => {
  it("returns models declaring organisationId, sorted", () => {
    expect(parseTenantScopedModels(schema)).toEqual(["Member", "Ticket"]);
  });

  it("excludes the tenant-root organisation", () => {
    expect(parseTenantScopedModels(schema)).not.toContain("Organisation");
  });

  it("ignores a relation field that merely references organisation", () => {
    const s = `model Foo {
      id           String @id
      organisation Organisation @relation(fields: [foo], references: [id])
    }`;
    expect(parseTenantScopedModels(s)).toEqual([]);
  });

  it("returns an empty list when there are no models", () => {
    expect(parseTenantScopedModels("")).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { Role } from "@/generated/prisma/enums";
import { hasAtLeast, assertRole, mapClerkRole } from "@/lib/auth/roles";
import { ForbiddenError } from "@/lib/core/errors";

describe("role hierarchy", () => {
  it("ranks OWNER > ADMIN > AGENT > VIEWER", () => {
    expect(hasAtLeast(Role.OWNER, Role.ADMIN)).toBe(true);
    expect(hasAtLeast(Role.ADMIN, Role.ADMIN)).toBe(true);
    expect(hasAtLeast(Role.AGENT, Role.ADMIN)).toBe(false);
    expect(hasAtLeast(Role.VIEWER, Role.AGENT)).toBe(false);
  });

  it("assertRole throws ForbiddenError below the minimum", () => {
    expect(() => assertRole(Role.AGENT, Role.ADMIN)).toThrow(ForbiddenError);
    expect(() => assertRole(Role.OWNER, Role.ADMIN)).not.toThrow();
  });
});

describe("mapClerkRole", () => {
  it("maps known Clerk roles", () => {
    expect(mapClerkRole("org:owner")).toBe(Role.OWNER);
    expect(mapClerkRole("org:admin")).toBe(Role.ADMIN);
    expect(mapClerkRole("org:agent")).toBe(Role.AGENT);
    expect(mapClerkRole("org:member")).toBe(Role.AGENT);
    expect(mapClerkRole("org:viewer")).toBe(Role.VIEWER);
  });

  it("falls back to least privilege for unknown/missing roles", () => {
    expect(mapClerkRole("org:something-new")).toBe(Role.VIEWER);
    expect(mapClerkRole(null)).toBe(Role.VIEWER);
    expect(mapClerkRole(undefined)).toBe(Role.VIEWER);
  });
});

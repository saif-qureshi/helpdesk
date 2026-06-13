import { describe, it, expect } from "vitest";
import { Role } from "@/generated/prisma/enums";
import { hasAtLeast, assertRole } from "@/lib/auth/roles";
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

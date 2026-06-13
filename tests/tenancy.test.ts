import { describe, it, expect } from "vitest";
import {
  assertTenantScoped,
  TenancyViolationError,
} from "@/lib/infra/tenancy";

describe("assertTenantScoped", () => {
  it("ignores models that are not tenant-scoped", () => {
    expect(() =>
      assertTenantScoped("Organisation", "findMany", { where: {} }),
    ).not.toThrow();
  });

  describe("where-scoped operations", () => {
    it("throws when organisationId is missing from where", () => {
      expect(() =>
        assertTenantScoped("Member", "findMany", { where: { role: "AGENT" } }),
      ).toThrow(TenancyViolationError);
    });

    it("throws when there is no where at all", () => {
      expect(() => assertTenantScoped("Member", "findMany", {})).toThrow(
        TenancyViolationError,
      );
    });

    it("passes when organisationId is present in where", () => {
      expect(() =>
        assertTenantScoped("Member", "findMany", {
          where: { organisationId: "org_1" },
        }),
      ).not.toThrow();
    });
  });

  describe("data-scoped operations", () => {
    it("throws when create data omits organisationId", () => {
      expect(() =>
        assertTenantScoped("Member", "create", {
          data: { clerkUserId: "u_1" },
        }),
      ).toThrow(TenancyViolationError);
    });

    it("passes when create data sets organisationId", () => {
      expect(() =>
        assertTenantScoped("Member", "create", {
          data: { clerkUserId: "u_1", organisationId: "org_1" },
        }),
      ).not.toThrow();
    });

    it("requires organisationId on every createMany row", () => {
      expect(() =>
        assertTenantScoped("Member", "createMany", {
          data: [{ organisationId: "org_1" }, { clerkUserId: "u_2" }],
        }),
      ).toThrow(TenancyViolationError);
    });
  });

  describe("upsert", () => {
    it("requires organisationId in the create branch", () => {
      expect(() =>
        assertTenantScoped("Member", "upsert", {
          where: { id: "m_1" },
          create: { clerkUserId: "u_1" },
          update: {},
        }),
      ).toThrow(TenancyViolationError);
    });
  });

  it("does not enforce unique-selector operations (left to repositories)", () => {
    expect(() =>
      assertTenantScoped("Member", "findUnique", { where: { id: "m_1" } }),
    ).not.toThrow();
    expect(() =>
      assertTenantScoped("Member", "delete", { where: { id: "m_1" } }),
    ).not.toThrow();
  });
});

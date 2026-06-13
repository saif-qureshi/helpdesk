import { describe, it, expect } from "vitest";
import { errors } from "@vinejs/vine";
import { onboardingValidator } from "@/app/api/onboarding/validator";

describe("onboardingValidator (VineJS)", () => {
  it("accepts a valid payload", async () => {
    const out = await onboardingValidator.validate({
      name: "Acme",
      slug: "acme-support",
      industry: "SaaS",
      teamSize: "2-10",
      invites: [{ email: "priya@acme.com", role: "ADMIN" }],
    });
    expect(out.name).toBe("Acme");
    expect(out.slug).toBe("acme-support");
    expect(out.invites?.[0]?.role).toBe("ADMIN");
  });

  it("rejects an invalid slug", async () => {
    await expect(
      onboardingValidator.validate({ name: "Acme", slug: "not a slug!" }),
    ).rejects.toBeInstanceOf(errors.E_VALIDATION_ERROR);
  });

  it("rejects an invalid invite email", async () => {
    await expect(
      onboardingValidator.validate({
        name: "Acme",
        slug: "acme",
        invites: [{ email: "nope", role: "AGENT" }],
      }),
    ).rejects.toBeInstanceOf(errors.E_VALIDATION_ERROR);
  });

  it("rejects an unknown invite role", async () => {
    await expect(
      onboardingValidator.validate({
        name: "Acme",
        slug: "acme",
        invites: [{ email: "a@acme.com", role: "OWNER" }],
      }),
    ).rejects.toBeInstanceOf(errors.E_VALIDATION_ERROR);
  });

  it("requires a name", async () => {
    await expect(
      onboardingValidator.validate({ slug: "acme" }),
    ).rejects.toBeInstanceOf(errors.E_VALIDATION_ERROR);
  });
});

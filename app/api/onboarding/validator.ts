import vine from "@vinejs/vine";

/**
 * Request validator for this route (colocated — single consumer). Compiled once
 * at module load; `.validate()` is async and throws E_VALIDATION_ERROR on bad
 * input, which the HTTP error mapper turns into a 422. Shared schemas (reused
 * across routes/layers) belong in lib/validators instead.
 */
export const onboardingValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    slug: vine
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/)
      .maxLength(50),
    logoUrl: vine.string().trim().nullable().optional(),
    industry: vine.string().trim().nullable().optional(),
    teamSize: vine.string().trim().nullable().optional(),
    defaultLanguage: vine.string().trim().nullable().optional(),
    timezone: vine.string().trim().nullable().optional(),
    invites: vine
      .array(
        vine.object({
          email: vine.string().trim().email(),
          role: vine.enum(["ADMIN", "AGENT"]),
        }),
      )
      .optional(),
  }),
);

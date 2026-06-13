import vine from "@vinejs/vine";

export const signUpValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(80).optional(),
    email: vine.string().trim().toLowerCase().email().maxLength(160),
    password: vine.string().minLength(8).maxLength(128),
  }),
);

export const signInValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email().maxLength(160),
    password: vine.string().minLength(1).maxLength(128),
  }),
);

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().toLowerCase().email().maxLength(160),
  }),
);

export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(8).maxLength(128),
  }),
);

const RETURN_TO_RE = /^\/[a-zA-Z0-9/_\-?=&%.]*$/;

export function safeReturnTo(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || !value) return null;
  return RETURN_TO_RE.test(value) ? value : null;
}

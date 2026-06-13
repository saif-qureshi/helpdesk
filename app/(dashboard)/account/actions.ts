"use server";

import { revalidatePath } from "next/cache";
import vine, { errors as vineErrors } from "@vinejs/vine";
import { AppError } from "@/lib/core/errors";
import { authService, userRepository } from "@/lib/container";
import { getCurrentUser } from "@/lib/auth/session";

const profileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(80),
  }),
);

const passwordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string().minLength(1).maxLength(128),
    newPassword: vine.string().minLength(8).maxLength(128),
  }),
);

export type AccountResult = { ok: true } | { ok: false; error: string };

function fail(err: unknown): AccountResult {
  if (err instanceof vineErrors.E_VALIDATION_ERROR) {
    const first = (err.messages as Array<{ message: string }>)[0];
    return { ok: false, error: first?.message ?? "Invalid input." };
  }
  if (err instanceof AppError) return { ok: false, error: err.message };
  console.error("[account-action]", err);
  return { ok: false, error: "Something went wrong." };
}

export async function updateProfileAction(
  formData: FormData,
): Promise<AccountResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Not signed in." };
    const data = await profileValidator.validate({
      name: formData.get("name"),
    });
    await userRepository.updateProfile(user.id, { name: data.name });
    revalidatePath("/account");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function changePasswordAction(
  formData: FormData,
): Promise<AccountResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Not signed in." };
    const data = await passwordValidator.validate({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    });
    await authService.changePassword(
      user.id,
      data.currentPassword,
      data.newPassword,
    );
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

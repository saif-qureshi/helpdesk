"use server";

import { redirect } from "next/navigation";
import { errors as vineErrors } from "@vinejs/vine";
import { AppError } from "@/lib/core/errors";
import { authService, memberRepository } from "@/lib/container";
import { setSessionCookie } from "@/lib/auth/session";
import {
  forgotPasswordValidator,
  resetPasswordValidator,
  safeReturnTo,
  signInValidator,
  signUpValidator,
} from "./validators";

export type FormState = { error: string | null; ok?: boolean };

function failure(err: unknown): FormState {
  if (err instanceof vineErrors.E_VALIDATION_ERROR) {
    const first = (err.messages as Array<{ message: string }>)[0];
    return { error: first?.message ?? "Invalid input." };
  }
  if (err instanceof AppError) return { error: err.message };
  console.error("[auth-action]", err);
  return { error: "Something went wrong. Please try again." };
}

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let returnTo: string | null = null;
  try {
    const data = await signUpValidator.validate({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name") || undefined,
    });
    returnTo = safeReturnTo(formData.get("returnTo"));

    const { session } = await authService.signUp({
      email: data.email,
      password: data.password,
      name: data.name ?? null,
    });
    setSessionCookie(session.id, session.expiresAt);
  } catch (err) {
    return failure(err);
  }
  redirect(returnTo ?? "/onboarding");
}

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let userId: string | null = null;
  let returnTo: string | null = null;
  try {
    const data = await signInValidator.validate({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    returnTo = safeReturnTo(formData.get("returnTo"));

    const { user, session } = await authService.signIn({
      email: data.email,
      password: data.password,
    });
    setSessionCookie(session.id, session.expiresAt);
    userId = user.id;
  } catch (err) {
    return failure(err);
  }
  if (returnTo) redirect(returnTo);
  const member = await memberRepository.findFirstByUser(userId!);
  redirect(member ? "/tickets" : "/onboarding");
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const data = await forgotPasswordValidator.validate({
      email: formData.get("email"),
    });
    await authService.requestPasswordReset(data.email);
    return { error: null, ok: true };
  } catch (err) {
    return failure(err);
  }
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = formData.get("token");
  if (typeof token !== "string" || !token) {
    return { error: "Invalid reset link." };
  }
  try {
    const data = await resetPasswordValidator.validate({
      password: formData.get("password"),
    });
    await authService.resetPassword(token, data.password);
  } catch (err) {
    return failure(err);
  }
  redirect("/sign-in?reset=1");
}

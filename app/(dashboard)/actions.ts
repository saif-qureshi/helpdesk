"use server";

import { authService } from "@/lib/container";
import { getCurrentUser } from "@/lib/auth/session";

export async function resendVerificationAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (user.emailVerified) return { ok: true };
  try {
    await authService.resendEmailVerification(user.id);
    return { ok: true };
  } catch (err) {
    console.error("[resend-verification]", err);
    return { ok: false, error: "Couldn't send the email. Try again." };
  }
}

import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { authService } from "@/lib/container";
import type { UserRecord } from "@/lib/core/auth";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

export { SESSION_COOKIE };

export function setSessionCookie(sessionId: string, expiresAt: Date): void {
  cookies().set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE);
}

export function getCurrentSessionId(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const sessionId = getCurrentSessionId();
  if (!sessionId) return null;
  const result = await authService.getSession(sessionId);
  return result?.user ?? null;
}

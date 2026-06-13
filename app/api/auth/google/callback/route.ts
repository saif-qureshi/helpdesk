import { NextResponse, type NextRequest } from "next/server";
import { decodeIdToken } from "arctic";
import { env } from "@/lib/env";
import { authService, memberRepository } from "@/lib/container";
import { SESSION_COOKIE } from "@/lib/auth/session";
import {
  GOOGLE_RETURN_TO_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  getGoogleProvider,
} from "@/lib/auth/google";

type GoogleClaims = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function fail(req: NextRequest, reason: string) {
  console.error("[google-callback]", reason);
  return NextResponse.redirect(new URL(`/sign-in?error=${reason}`, req.url));
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const storedVerifier = req.cookies.get(GOOGLE_VERIFIER_COOKIE)?.value;
  const returnTo = req.cookies.get(GOOGLE_RETURN_TO_COOKIE)?.value;

  if (!code || !state || !storedState || !storedVerifier) {
    return fail(req, "google_missing_state");
  }
  if (state !== storedState) {
    return fail(req, "google_state_mismatch");
  }

  let provider;
  try {
    provider = getGoogleProvider();
  } catch {
    return fail(req, "google_unavailable");
  }

  let result;
  try {
    const tokens = await provider.validateAuthorizationCode(code, storedVerifier);
    const claims = decodeIdToken(tokens.idToken()) as GoogleClaims;
    result = await authService.loginWithGoogle({
      googleId: claims.sub,
      email: claims.email,
      name: claims.name ?? null,
      image: claims.picture ?? null,
    });
  } catch (err) {
    console.error("[google-callback] token exchange failed", err);
    return fail(req, "google_exchange_failed");
  }

  const member = await memberRepository.findFirstByUser(result.user.id);
  const redirectTo = returnTo ?? (member ? "/tickets" : "/onboarding");

  const res = NextResponse.redirect(new URL(redirectTo, req.url));
  res.cookies.set(SESSION_COOKIE, result.session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    expires: result.session.expiresAt,
  });
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  res.cookies.delete(GOOGLE_VERIFIER_COOKIE);
  res.cookies.delete(GOOGLE_RETURN_TO_COOKIE);
  return res;
}

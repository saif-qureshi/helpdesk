import { NextResponse } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";
import { env } from "@/lib/env";
import {
  GOOGLE_RETURN_TO_COOKIE,
  GOOGLE_SCOPES,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  getGoogleProvider,
} from "@/lib/auth/google";
import { safeReturnTo } from "@/app/(auth)/validators";

export async function GET(req: Request) {
  let provider;
  try {
    provider = getGoogleProvider();
  } catch (err) {
    console.error("[google-oauth] provider error", err);
    return NextResponse.redirect(
      new URL("/sign-in?error=google_unavailable", req.url),
    );
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = provider.createAuthorizationURL(state, codeVerifier, GOOGLE_SCOPES);

  const reqUrl = new URL(req.url);
  const returnTo = safeReturnTo(reqUrl.searchParams.get("returnTo"));

  const res = NextResponse.redirect(url);
  const baseCookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  };
  res.cookies.set(GOOGLE_STATE_COOKIE, state, baseCookie);
  res.cookies.set(GOOGLE_VERIFIER_COOKIE, codeVerifier, baseCookie);
  if (returnTo) {
    res.cookies.set(GOOGLE_RETURN_TO_COOKIE, returnTo, baseCookie);
  } else {
    res.cookies.delete(GOOGLE_RETURN_TO_COOKIE);
  }
  return res;
}

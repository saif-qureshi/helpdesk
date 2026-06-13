import { Google } from "arctic";
import { env } from "@/lib/env";

const REDIRECT_PATH = "/api/auth/google/callback";

let cached: Google | null = null;

export function getGoogleProvider(): Google {
  if (cached) return cached;
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    );
  }
  cached = new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXT_PUBLIC_APP_URL}${REDIRECT_PATH}`,
  );
  return cached;
}

export const GOOGLE_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_VERIFIER_COOKIE = "google_oauth_verifier";
export const GOOGLE_RETURN_TO_COOKIE = "google_oauth_return_to";
export const GOOGLE_SCOPES = ["openid", "email", "profile"];

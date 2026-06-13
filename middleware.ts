import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/auth/clerk-config";

/**
 * Routes reachable without authentication. Everything else requires a signed-in
 * user. Webhooks and the public widget/health endpoints verify their own
 * callers, so they stay public here.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  // The /invite page handles auth itself (signed-in → accept; else → sign-up).
  "/invite(.*)",
  // The onboarding handler enforces auth itself (returns 401 → the page
  // redirects to sign-in). Without this, Clerk's auth.protect() 404s the
  // unauthenticated fetch instead of letting the handler respond.
  "/api/onboarding",
  "/api/widget/(.*)",
  "/api/webhooks/(.*)",
  "/api/health",
]);

const enforced = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// Until Clerk has real keys, run a pass-through so the static UI is viewable
// without auth. Auth turns on automatically once keys are configured.
export default isClerkConfigured ? enforced : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};

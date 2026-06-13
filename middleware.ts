import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-cookie";

const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/invite",
  "/api/auth",
  "/api/onboarding",
  "/api/widget",
  "/api/webhooks",
  "/api/health",
];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  if (req.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();

  const signIn = new URL("/sign-in", req.url);
  signIn.searchParams.set("returnTo", pathname + req.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/lib/container";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    try {
      await authService.signOut(sessionId);
    } catch (err) {
      console.error("[sign-out]", err);
    }
  }
  const res = NextResponse.redirect(new URL("/sign-in", req.url), {
    status: 303,
  });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

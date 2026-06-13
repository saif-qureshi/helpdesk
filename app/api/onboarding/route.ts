import { NextResponse } from "next/server";
import { onboardingService } from "@/lib/container";
import { UnauthorizedError } from "@/lib/core/errors";
import { toHttpError } from "@/lib/http/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { onboardingValidator } from "./validator";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new UnauthorizedError("Not signed in");

    const body = await onboardingValidator.validate(await req.json());

    const organisation = await onboardingService.createWorkspace({
      userId: user.id,
      userEmail: user.email,
      name: body.name,
      slug: body.slug,
      logoUrl: body.logoUrl,
      industry: body.industry,
      teamSize: body.teamSize,
      defaultLanguage: body.defaultLanguage,
      timezone: body.timezone,
      invites: body.invites,
    });

    return NextResponse.json({ organisation }, { status: 201 });
  } catch (err) {
    return toHttpError(err);
  }
}

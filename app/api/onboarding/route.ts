import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { onboardingService } from "@/lib/container";
import { UnauthorizedError, ValidationError } from "@/lib/core/errors";
import { toHttpError } from "@/lib/http/errors";
import { onboardingValidator } from "./validator";

export const runtime = "nodejs";

/** POST /api/onboarding — create a workspace for the signed-in user. */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) throw new UnauthorizedError("Not signed in");

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) throw new ValidationError("Account has no primary email");

    const body = await onboardingValidator.validate(await req.json());

    const organisation = await onboardingService.createWorkspace({
      userId,
      userEmail: email,
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

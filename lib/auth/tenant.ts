import { auth } from "@clerk/nextjs/server";
import type { Role } from "@/generated/prisma/enums";
import type { TenantContext } from "@/lib/core/tenant";
import { ForbiddenError, UnauthorizedError } from "@/lib/core/errors";
import { assertRole } from "@/lib/auth/roles";
import { memberRepository } from "@/lib/container";

/**
 * Resolve the signed-in Clerk user into their active org membership (our DB).
 * Multi-org switching isn't built yet — uses the user's first membership.
 */
export async function requireOrg(): Promise<TenantContext> {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError("Not signed in");

  const member = await memberRepository.findFirstByClerkUser(userId);
  if (!member) {
    throw new ForbiddenError("No workspace yet — complete onboarding");
  }

  return {
    userId,
    organisationId: member.organisationId,
    role: member.role,
  };
}

/** Active organisation id for the signed-in user, or null. */
export async function getOrgId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const member = await memberRepository.findFirstByClerkUser(userId);
  return member?.organisationId ?? null;
}

/** Like {@link requireOrg} but also enforces a minimum role. */
export async function requireRole(minimum: Role): Promise<TenantContext> {
  const ctx = await requireOrg();
  assertRole(ctx.role, minimum);
  return ctx;
}

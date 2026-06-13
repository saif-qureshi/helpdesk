import type { Role } from "@/generated/prisma/enums";
import type { TenantContext } from "@/lib/core/tenant";
import { ForbiddenError, UnauthorizedError } from "@/lib/core/errors";
import { assertRole } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { memberRepository } from "@/lib/container";

export async function requireOrg(): Promise<TenantContext> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError("Not signed in");

  const member = await memberRepository.findFirstByUser(user.id);
  if (!member) {
    throw new ForbiddenError("No workspace yet — complete onboarding");
  }

  return {
    userId: user.id,
    organisationId: member.organisationId,
    role: member.role,
  };
}

export async function getOrgId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const member = await memberRepository.findFirstByUser(user.id);
  return member?.organisationId ?? null;
}

export async function requireRole(minimum: Role): Promise<TenantContext> {
  const ctx = await requireOrg();
  assertRole(ctx.role, minimum);
  return ctx;
}

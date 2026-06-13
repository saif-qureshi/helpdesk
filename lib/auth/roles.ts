import { Role } from "@/generated/prisma/enums";
import { ForbiddenError } from "@/lib/core/errors";

/**
 * Role helpers — pure and Clerk-agnostic so they're trivially testable.
 *
 * Privilege order: OWNER > ADMIN > AGENT > VIEWER.
 */
const RANK: Record<Role, number> = {
  [Role.VIEWER]: 1,
  [Role.AGENT]: 2,
  [Role.ADMIN]: 3,
  [Role.OWNER]: 4,
};

export function hasAtLeast(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

/** Throws {@link ForbiddenError} unless `role` meets the minimum. */
export function assertRole(role: Role, minimum: Role): void {
  if (!hasAtLeast(role, minimum)) {
    throw new ForbiddenError(
      `Requires ${minimum} or higher; caller is ${role}`,
    );
  }
}

/**
 * Maps a Clerk organisation role (e.g. "org:admin") to our {@link Role}.
 * Unknown roles fall back to the least-privileged role.
 */
const CLERK_ROLE_MAP: Record<string, Role> = {
  "org:owner": Role.OWNER,
  "org:admin": Role.ADMIN,
  "org:agent": Role.AGENT,
  "org:member": Role.AGENT,
  "org:viewer": Role.VIEWER,
};

export function mapClerkRole(clerkRole: string | null | undefined): Role {
  if (!clerkRole) return Role.VIEWER;
  return CLERK_ROLE_MAP[clerkRole] ?? Role.VIEWER;
}

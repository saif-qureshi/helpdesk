import { Role } from "@/generated/prisma/enums";
import { ForbiddenError } from "@/lib/core/errors";

const RANK: Record<Role, number> = {
  [Role.VIEWER]: 1,
  [Role.AGENT]: 2,
  [Role.ADMIN]: 3,
  [Role.OWNER]: 4,
};

export function hasAtLeast(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

export function assertRole(role: Role, minimum: Role): void {
  if (!hasAtLeast(role, minimum)) {
    throw new ForbiddenError(
      `Requires ${minimum} or higher; caller is ${role}`,
    );
  }
}

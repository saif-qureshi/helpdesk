import type { Role } from "@/generated/prisma/enums";

/** The signed-in caller's tenant context. `userId` is the Clerk user id. */
export interface TenantContext {
  userId: string;
  organisationId: string;
  role: Role;
}

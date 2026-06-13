import type { Role } from "@/generated/prisma/enums";

export interface TenantContext {
  userId: string;
  organisationId: string;
  role: Role;
}

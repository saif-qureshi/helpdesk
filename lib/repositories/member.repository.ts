import type { Db } from "@/lib/infra/db";
import type { Role } from "@/generated/prisma/enums";
import type {
  IMemberRepository,
  MemberRecord,
  UpsertMemberInput,
} from "@/lib/core/repositories";

/**
 * Prisma-backed {@link IMemberRepository}. Member is tenant-scoped, so every
 * query passes `organisationId` (also satisfying the tenancy guard).
 */
export class PrismaMemberRepository implements IMemberRepository {
  constructor(private readonly db: Db) {}

  async findFirstByClerkUser(clerkUserId: string): Promise<MemberRecord | null> {
    const row = await this.db.member.findFirst({
      where: { clerkUserId },
      orderBy: { createdAt: "asc" },
    });
    return row && this.toRecord(row);
  }

  async findByClerkUser(
    clerkUserId: string,
    organisationId: string,
  ): Promise<MemberRecord | null> {
    const row = await this.db.member.findFirst({
      where: { clerkUserId, organisationId },
    });
    return row && this.toRecord(row);
  }

  async listByOrganisation(organisationId: string): Promise<MemberRecord[]> {
    const rows = await this.db.member.findMany({
      where: { organisationId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => this.toRecord(row));
  }

  async upsert(input: UpsertMemberInput): Promise<MemberRecord> {
    const name = input.name ?? null;
    const row = await this.db.member.upsert({
      where: {
        clerkUserId_organisationId: {
          clerkUserId: input.clerkUserId,
          organisationId: input.organisationId,
        },
      },
      create: {
        clerkUserId: input.clerkUserId,
        organisationId: input.organisationId,
        role: input.role,
        email: input.email,
        name,
      },
      update: { role: input.role, email: input.email, name },
    });
    return this.toRecord(row);
  }

  async updateRole(
    id: string,
    organisationId: string,
    role: Role,
  ): Promise<void> {
    await this.db.member.updateMany({
      where: { id, organisationId },
      data: { role },
    });
  }

  async deleteById(id: string, organisationId: string): Promise<void> {
    await this.db.member.deleteMany({ where: { id, organisationId } });
  }

  async deleteByClerkUser(
    clerkUserId: string,
    organisationId: string,
  ): Promise<void> {
    await this.db.member.deleteMany({ where: { clerkUserId, organisationId } });
  }

  private toRecord(row: {
    id: string;
    clerkUserId: string;
    organisationId: string;
    role: Role;
    email: string;
    name: string | null;
  }): MemberRecord {
    return {
      id: row.id,
      clerkUserId: row.clerkUserId,
      organisationId: row.organisationId,
      role: row.role,
      email: row.email,
      name: row.name,
    };
  }
}

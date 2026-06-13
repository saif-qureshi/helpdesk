import type { Db } from "@/lib/infra/db";
import type { Role } from "@/generated/prisma/enums";
import type {
  IMemberRepository,
  MemberRecord,
  UpsertMemberInput,
} from "@/lib/core/repositories";

export class PrismaMemberRepository implements IMemberRepository {
  constructor(private readonly db: Db) {}

  async findFirstByUser(userId: string): Promise<MemberRecord | null> {
    const row = await this.db.member.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return row && this.toRecord(row);
  }

  async findByUser(
    userId: string,
    organisationId: string,
  ): Promise<MemberRecord | null> {
    const row = await this.db.member.findFirst({
      where: { userId, organisationId },
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
        userId_organisationId: {
          userId: input.userId,
          organisationId: input.organisationId,
        },
      },
      create: {
        userId: input.userId,
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

  async deleteByUser(userId: string, organisationId: string): Promise<void> {
    await this.db.member.deleteMany({ where: { userId, organisationId } });
  }

  private toRecord(row: {
    id: string;
    userId: string;
    organisationId: string;
    role: Role;
    email: string;
    name: string | null;
  }): MemberRecord {
    return {
      id: row.id,
      userId: row.userId,
      organisationId: row.organisationId,
      role: row.role,
      email: row.email,
      name: row.name,
    };
  }
}

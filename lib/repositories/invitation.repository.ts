import type { Db } from "@/lib/infra/db";
import type { InvitationStatus, Role } from "@/generated/prisma/enums";
import type {
  CreateInvitationInput,
  IInvitationRepository,
  InvitationRecord,
} from "@/lib/core/repositories";

export class PrismaInvitationRepository implements IInvitationRepository {
  constructor(private readonly db: Db) {}

  async create(input: CreateInvitationInput): Promise<InvitationRecord> {
    const row = await this.db.invitation.create({
      data: {
        organisationId: input.organisationId,
        email: input.email,
        role: input.role,
        token: input.token,
      },
    });
    return this.toRecord(row);
  }

  async listByOrganisation(organisationId: string): Promise<InvitationRecord[]> {
    const rows = await this.db.invitation.findMany({
      where: { organisationId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findByToken(token: string): Promise<InvitationRecord | null> {
    const row = await this.db.invitation.findUnique({ where: { token } });
    return row && this.toRecord(row);
  }

  async markAccepted(id: string): Promise<void> {
    await this.db.invitation.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
  }

  async setToken(
    id: string,
    organisationId: string,
    token: string,
  ): Promise<void> {
    await this.db.invitation.updateMany({
      where: { id, organisationId },
      data: { token, status: "PENDING" },
    });
  }

  async deleteById(id: string, organisationId: string): Promise<void> {
    await this.db.invitation.deleteMany({ where: { id, organisationId } });
  }

  private toRecord(row: {
    id: string;
    organisationId: string;
    email: string;
    role: Role;
    status: InvitationStatus;
  }): InvitationRecord {
    return {
      id: row.id,
      organisationId: row.organisationId,
      email: row.email,
      role: row.role,
      status: row.status,
    };
  }
}

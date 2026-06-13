import type { Db } from "@/lib/infra/db";
import type { ChannelKind, ChannelStatus } from "@/generated/prisma/enums";
import type {
  ChannelRecord,
  CreateChannelInput,
  IChannelRepository,
} from "@/lib/core/repositories";
import { decryptJson, encryptJson } from "@/lib/auth/secrets";

type Row = {
  id: string;
  organisationId: string;
  kind: ChannelKind;
  displayName: string;
  externalId: string;
  status: ChannelStatus;
  credentials: unknown;
  config: unknown;
  connectedAt: Date | null;
};

export class PrismaChannelRepository implements IChannelRepository {
  constructor(private readonly db: Db) {}

  async create(input: CreateChannelInput): Promise<ChannelRecord> {
    const row = await this.db.channel.create({
      data: {
        organisationId: input.organisationId,
        kind: input.kind,
        displayName: input.displayName,
        externalId: input.externalId,
        credentials: encryptJson(input.credentials),
        config: (input.config as object | undefined) ?? {},
        status: "ACTIVE",
        connectedAt: new Date(),
      },
    });
    return this.toRecord(row);
  }

  async findById(
    id: string,
    organisationId: string,
  ): Promise<ChannelRecord | null> {
    const row = await this.db.channel.findFirst({
      where: { id, organisationId },
    });
    return row && this.toRecord(row);
  }

  async findByExternalId(
    kind: ChannelKind,
    externalId: string,
  ): Promise<ChannelRecord | null> {
    const row = await this.db.channel.findFirst({
      where: { kind, externalId },
    });
    return row && this.toRecord(row);
  }

  async listByOrganisation(organisationId: string): Promise<ChannelRecord[]> {
    const rows = await this.db.channel.findMany({
      where: { organisationId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => this.toRecord(row));
  }

  async setStatus(
    id: string,
    organisationId: string,
    status: ChannelStatus,
    lastError?: string | null,
  ): Promise<void> {
    await this.db.channel.updateMany({
      where: { id, organisationId },
      data: { status, lastError: lastError ?? null },
    });
  }

  async delete(id: string, organisationId: string): Promise<void> {
    await this.db.channel.deleteMany({ where: { id, organisationId } });
  }

  private toRecord(row: Row): ChannelRecord {
    return {
      id: row.id,
      organisationId: row.organisationId,
      kind: row.kind,
      displayName: row.displayName,
      externalId: row.externalId,
      status: row.status,
      credentials:
        typeof row.credentials === "string"
          ? decryptJson(row.credentials)
          : row.credentials,
      config: row.config,
      connectedAt: row.connectedAt,
    };
  }
}

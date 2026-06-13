import type { Db } from "@/lib/infra/db";
import type { ConversationStatus } from "@/generated/prisma/enums";
import type {
  ConversationRecord,
  CreateConversationInput,
  IConversationRepository,
} from "@/lib/core/repositories";

type Row = {
  id: string;
  organisationId: string;
  contactId: string;
  channelId: string;
  status: ConversationStatus;
  subject: string | null;
  assigneeId: string | null;
  aiSummary: string | null;
  aiCategory: string | null;
  lastMessageAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
};

export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly db: Db) {}

  async create(input: CreateConversationInput): Promise<ConversationRecord> {
    const row = await this.db.conversation.create({
      data: {
        organisationId: input.organisationId,
        contactId: input.contactId,
        channelId: input.channelId,
        subject: input.subject ?? null,
        lastMessageAt: input.initialLastMessageAt,
      },
    });
    return this.toRecord(row);
  }

  async findById(
    id: string,
    organisationId: string,
  ): Promise<ConversationRecord | null> {
    const row = await this.db.conversation.findFirst({
      where: { id, organisationId },
    });
    return row && this.toRecord(row);
  }

  async findLatestForContact(
    organisationId: string,
    contactId: string,
    channelId: string,
  ): Promise<ConversationRecord | null> {
    const row = await this.db.conversation.findFirst({
      where: { organisationId, contactId, channelId },
      orderBy: { lastMessageAt: "desc" },
    });
    return row && this.toRecord(row);
  }

  async listByOrganisation(input: {
    organisationId: string;
    status?: ConversationStatus | ConversationStatus[];
    assigneeId?: string | null;
    channelId?: string;
    limit?: number;
  }): Promise<ConversationRecord[]> {
    const rows = await this.db.conversation.findMany({
      where: {
        organisationId: input.organisationId,
        ...(input.status
          ? {
              status: Array.isArray(input.status)
                ? { in: input.status }
                : input.status,
            }
          : {}),
        ...(input.assigneeId !== undefined
          ? { assigneeId: input.assigneeId }
          : {}),
        ...(input.channelId ? { channelId: input.channelId } : {}),
      },
      orderBy: { lastMessageAt: "desc" },
      take: input.limit ?? 50,
    });
    return rows.map((row) => this.toRecord(row));
  }

  async setStatus(
    id: string,
    organisationId: string,
    status: ConversationStatus,
    extra?: { assigneeId?: string | null; resolvedAt?: Date | null },
  ): Promise<void> {
    await this.db.conversation.updateMany({
      where: { id, organisationId },
      data: {
        status,
        ...(extra && "assigneeId" in extra
          ? { assigneeId: extra.assigneeId }
          : {}),
        ...(extra && "resolvedAt" in extra
          ? { resolvedAt: extra.resolvedAt }
          : {}),
      },
    });
  }

  async touchLastMessageAt(
    id: string,
    organisationId: string,
    when: Date,
  ): Promise<void> {
    await this.db.conversation.updateMany({
      where: { id, organisationId },
      data: { lastMessageAt: when },
    });
  }

  private toRecord(row: Row): ConversationRecord {
    return {
      id: row.id,
      organisationId: row.organisationId,
      contactId: row.contactId,
      channelId: row.channelId,
      status: row.status,
      subject: row.subject,
      assigneeId: row.assigneeId,
      aiSummary: row.aiSummary,
      aiCategory: row.aiCategory,
      lastMessageAt: row.lastMessageAt,
      resolvedAt: row.resolvedAt,
      createdAt: row.createdAt,
    };
  }
}

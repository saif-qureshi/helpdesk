import type { Db } from "@/lib/infra/db";
import type {
  MessageAuthor,
  MessageDeliveryStatus,
  MessageDirection,
} from "@/generated/prisma/enums";
import type {
  CreateMessageInput,
  IMessageRepository,
  MessageRecord,
} from "@/lib/core/repositories";

type Row = {
  id: string;
  organisationId: string;
  conversationId: string;
  direction: MessageDirection;
  author: MessageAuthor;
  authorMemberId: string | null;
  body: string;
  richContent: unknown;
  channelMessageId: string | null;
  replyToMessageId: string | null;
  deliveryStatus: MessageDeliveryStatus;
  failureReason: string | null;
  sentAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
};

export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly db: Db) {}

  async create(input: CreateMessageInput): Promise<MessageRecord> {
    const row = await this.db.message.create({
      data: {
        organisationId: input.organisationId,
        conversationId: input.conversationId,
        direction: input.direction,
        author: input.author,
        authorMemberId: input.authorMemberId ?? null,
        body: input.body,
        richContent: (input.richContent as object | undefined) ?? undefined,
        channelMessageId: input.channelMessageId ?? null,
        replyToMessageId: input.replyToMessageId ?? null,
        deliveryStatus: input.deliveryStatus ?? "QUEUED",
        sentAt: input.sentAt ?? new Date(),
        ...(input.attachments && input.attachments.length > 0
          ? {
              attachments: {
                create: input.attachments.map((a) => ({
                  organisationId: input.organisationId,
                  kind: a.kind,
                  url: a.url,
                  mimeType: a.mimeType ?? null,
                  fileName: a.fileName ?? null,
                  sizeBytes: a.sizeBytes ?? null,
                })),
              },
            }
          : {}),
      },
    });
    return this.toRecord(row);
  }

  async findByChannelMessageId(
    organisationId: string,
    channelMessageId: string,
  ): Promise<MessageRecord | null> {
    const row = await this.db.message.findFirst({
      where: { organisationId, channelMessageId },
    });
    return row && this.toRecord(row);
  }

  async listByConversation(
    organisationId: string,
    conversationId: string,
  ): Promise<MessageRecord[]> {
    const rows = await this.db.message.findMany({
      where: { organisationId, conversationId },
      orderBy: { sentAt: "asc" },
    });
    return rows.map((row) => this.toRecord(row));
  }

  async setDeliveryStatus(
    organisationId: string,
    channelMessageId: string,
    status: MessageDeliveryStatus,
    extra?: { failureReason?: string; deliveredAt?: Date; readAt?: Date },
  ): Promise<void> {
    await this.db.message.updateMany({
      where: { organisationId, channelMessageId },
      data: {
        deliveryStatus: status,
        ...(extra?.failureReason !== undefined
          ? { failureReason: extra.failureReason }
          : {}),
        ...(extra?.deliveredAt ? { deliveredAt: extra.deliveredAt } : {}),
        ...(extra?.readAt ? { readAt: extra.readAt } : {}),
      },
    });
  }

  private toRecord(row: Row): MessageRecord {
    return {
      id: row.id,
      organisationId: row.organisationId,
      conversationId: row.conversationId,
      direction: row.direction,
      author: row.author,
      authorMemberId: row.authorMemberId,
      body: row.body,
      richContent: row.richContent,
      channelMessageId: row.channelMessageId,
      replyToMessageId: row.replyToMessageId,
      deliveryStatus: row.deliveryStatus,
      failureReason: row.failureReason,
      sentAt: row.sentAt,
      deliveredAt: row.deliveredAt,
      readAt: row.readAt,
    };
  }
}

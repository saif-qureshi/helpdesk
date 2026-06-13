import { ConversationStatus } from "@/generated/prisma/enums";
import { ValidationError } from "@/lib/core/errors";
import type {
  ConversationRecord,
  CreateMessageInput,
  IContactRepository,
  IConversationRepository,
  IMessageRepository,
  MessageRecord,
} from "@/lib/core/repositories";

const ALLOWED: Record<ConversationStatus, ConversationStatus[]> = {
  OPEN: [
    ConversationStatus.AI_HANDLING,
    ConversationStatus.WAITING_AGENT,
    ConversationStatus.ASSIGNED,
    ConversationStatus.RESOLVED,
  ],
  AI_HANDLING: [
    ConversationStatus.WAITING_AGENT,
    ConversationStatus.ASSIGNED,
    ConversationStatus.RESOLVED,
  ],
  WAITING_AGENT: [
    ConversationStatus.AI_HANDLING,
    ConversationStatus.ASSIGNED,
    ConversationStatus.RESOLVED,
  ],
  ASSIGNED: [
    ConversationStatus.WAITING_AGENT,
    ConversationStatus.AI_HANDLING,
    ConversationStatus.RESOLVED,
  ],
  RESOLVED: [ConversationStatus.WAITING_AGENT, ConversationStatus.ARCHIVED],
  ARCHIVED: [ConversationStatus.WAITING_AGENT],
};

function assertTransition(
  from: ConversationStatus,
  to: ConversationStatus,
): void {
  if (from === to) return;
  if (!ALLOWED[from].includes(to)) {
    throw new ValidationError(
      `Invalid Conversation transition: ${from} → ${to}`,
    );
  }
}

export class ConversationService {
  constructor(
    private readonly contacts: IContactRepository,
    private readonly conversations: IConversationRepository,
    private readonly messages: IMessageRepository,
  ) {}

  /** Append an inbound message from an end customer; create/re-open the conversation. */
  async ingestInbound(input: {
    organisationId: string;
    channelId: string;
    contactId: string;
    body: string;
    richContent?: unknown;
    channelMessageId: string;
    sentAt: Date;
    attachments?: CreateMessageInput["attachments"];
  }): Promise<{ conversation: ConversationRecord; message: MessageRecord }> {
    const existing = await this.messages.findByChannelMessageId(
      input.organisationId,
      input.channelMessageId,
    );
    if (existing) {
      const conv = await this.conversations.findById(
        existing.conversationId,
        input.organisationId,
      );
      if (conv) return { conversation: conv, message: existing };
    }

    const latest = await this.conversations.findLatestForContact(
      input.organisationId,
      input.contactId,
      input.channelId,
    );

    let conversation: ConversationRecord;
    if (latest) {
      conversation = latest;
      if (
        latest.status === ConversationStatus.RESOLVED ||
        latest.status === ConversationStatus.ARCHIVED
      ) {
        await this.conversations.setStatus(
          latest.id,
          input.organisationId,
          ConversationStatus.WAITING_AGENT,
          { resolvedAt: null },
        );
        conversation = {
          ...latest,
          status: ConversationStatus.WAITING_AGENT,
          resolvedAt: null,
        };
      }
    } else {
      conversation = await this.conversations.create({
        organisationId: input.organisationId,
        contactId: input.contactId,
        channelId: input.channelId,
        initialLastMessageAt: input.sentAt,
      });
    }

    const message = await this.messages.create({
      organisationId: input.organisationId,
      conversationId: conversation.id,
      direction: "INBOUND",
      author: "CONTACT",
      body: input.body,
      richContent: input.richContent,
      channelMessageId: input.channelMessageId,
      sentAt: input.sentAt,
      deliveryStatus: "DELIVERED",
      attachments: input.attachments,
    });

    await this.conversations.touchLastMessageAt(
      conversation.id,
      input.organisationId,
      input.sentAt,
    );

    return {
      conversation: { ...conversation, lastMessageAt: input.sentAt },
      message,
    };
  }

  /** Persist an outbound reply from an agent; transition status if needed. */
  async replyAsAgent(input: {
    organisationId: string;
    conversationId: string;
    memberId: string;
    body: string;
  }): Promise<MessageRecord> {
    const conv = await this.conversations.findById(
      input.conversationId,
      input.organisationId,
    );
    if (!conv) throw new ValidationError("Conversation not found.");

    const message = await this.messages.create({
      organisationId: input.organisationId,
      conversationId: input.conversationId,
      direction: "OUTBOUND",
      author: "AGENT",
      authorMemberId: input.memberId,
      body: input.body,
    });

    if (conv.status !== ConversationStatus.ASSIGNED) {
      await this.transitionStatus(
        conv,
        ConversationStatus.ASSIGNED,
        input.memberId,
      );
    } else if (conv.assigneeId !== input.memberId) {
      await this.conversations.setStatus(
        conv.id,
        input.organisationId,
        ConversationStatus.ASSIGNED,
        { assigneeId: input.memberId },
      );
    }

    await this.conversations.touchLastMessageAt(
      conv.id,
      input.organisationId,
      message.sentAt,
    );
    return message;
  }

  /** AI couldn't handle it; queue for a human + log a system note. */
  async escalateToAgent(
    conversation: ConversationRecord,
    reason: string,
  ): Promise<void> {
    await this.transitionStatus(conversation, ConversationStatus.WAITING_AGENT);
    await this.messages.create({
      organisationId: conversation.organisationId,
      conversationId: conversation.id,
      direction: "OUTBOUND",
      author: "SYSTEM",
      body: `Escalated to agent: ${reason}`,
      deliveryStatus: "DELIVERED",
    });
  }

  async resolve(
    conversation: ConversationRecord,
    memberId?: string,
  ): Promise<void> {
    await this.transitionStatus(
      conversation,
      ConversationStatus.RESOLVED,
      memberId,
      new Date(),
    );
  }

  private async transitionStatus(
    conversation: ConversationRecord,
    to: ConversationStatus,
    assigneeId?: string | null,
    resolvedAt?: Date | null,
  ): Promise<void> {
    assertTransition(conversation.status, to);
    await this.conversations.setStatus(
      conversation.id,
      conversation.organisationId,
      to,
      {
        ...(assigneeId !== undefined ? { assigneeId } : {}),
        ...(resolvedAt !== undefined ? { resolvedAt } : {}),
      },
    );
  }
}

export { assertTransition as __assertTransitionForTests };

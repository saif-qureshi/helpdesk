import type { AttachmentKind, ChannelKind } from "@/generated/prisma/enums";

export interface ChannelRecord {
  id: string;
  organisationId: string;
  kind: ChannelKind;
  externalId: string;
  displayName: string;
  credentials: unknown;
  config: unknown;
}

export interface IncomingContact {
  externalIdentifier: string;
  displayName?: string;
  phone?: string;
  email?: string;
}

export interface IncomingAttachment {
  kind: AttachmentKind;
  sourceUrl: string;
  mimeType?: string;
  fileName?: string;
  sizeBytes?: number;
}

export interface IncomingMessage {
  externalMessageId: string;
  contact: IncomingContact;
  body: string;
  richContent?: unknown;
  attachments?: IncomingAttachment[];
  replyToExternalId?: string;
  sentAt: Date;
}

export interface OutgoingAttachment {
  kind: AttachmentKind;
  url: string;
  fileName?: string;
}

export interface OutgoingMessage {
  conversationId: string;
  body?: string;
  template?: {
    name: string;
    language: string;
    variables: Record<string, string>;
  };
  richContent?: unknown;
  attachments?: OutgoingAttachment[];
}

export interface SendResult {
  externalMessageId: string;
  deliveredAt?: Date;
}

export type WebhookEvent =
  | { kind: "message"; channelId: string; message: IncomingMessage }
  | {
      kind: "delivery";
      channelId: string;
      externalMessageId: string;
      status: "DELIVERED" | "READ" | "FAILED";
      reason?: string;
    }
  | {
      kind: "template_status";
      channelId: string;
      externalTemplateId: string;
      status: "APPROVED" | "REJECTED";
      reason?: string;
    }
  | { kind: "channel_error"; channelId: string; reason: string };

export interface ConnectResult {
  externalId: string;
  displayName: string;
  credentials: unknown;
  config?: unknown;
}

export interface IChannelProvider {
  readonly kind: ChannelKind;

  connect(input: {
    organisationId: string;
    payload: unknown;
  }): Promise<ConnectResult>;

  disconnect(channel: ChannelRecord): Promise<void>;

  send(channel: ChannelRecord, message: OutgoingMessage): Promise<SendResult>;

  parseWebhook(input: {
    headers: Record<string, string>;
    body: unknown;
    rawBody: string;
  }): Promise<WebhookEvent[]>;

  submitTemplate?(
    channel: ChannelRecord,
    template: {
      name: string;
      language: string;
      category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
      bodyTemplate: string;
      variables: Array<{ name: string; example: string }>;
    },
  ): Promise<{ externalTemplateId: string; status: "PENDING" }>;
}

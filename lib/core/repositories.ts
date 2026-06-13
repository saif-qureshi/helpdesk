import type {
  AttachmentKind,
  ChannelKind,
  ChannelStatus,
  ConversationStatus,
  InvitationStatus,
  MessageAuthor,
  MessageDeliveryStatus,
  MessageDirection,
  Role,
} from "@/generated/prisma/enums";

export interface OrganisationRecord {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  industry: string | null;
  teamSize: string | null;
  defaultLanguage: string | null;
  timezone: string | null;
}

/** Editable workspace profile fields, shared by onboarding + general settings. */
export interface OrganisationProfile {
  logoUrl?: string | null;
  industry?: string | null;
  teamSize?: string | null;
  defaultLanguage?: string | null;
  timezone?: string | null;
}

export interface CreateOrganisationInput extends OrganisationProfile {
  name: string;
  slug: string;
}

export interface IOrganisationRepository {
  create(input: CreateOrganisationInput): Promise<OrganisationRecord>;
  findById(id: string): Promise<OrganisationRecord | null>;
  findBySlug(slug: string): Promise<OrganisationRecord | null>;
}

export interface MemberRecord {
  id: string;
  userId: string;
  organisationId: string;
  role: Role;
  email: string;
  name: string | null;
}

export interface UpsertMemberInput {
  userId: string;
  organisationId: string;
  role: Role;
  email: string;
  name?: string | null;
}

export interface IMemberRepository {
  /** The user's first membership — the active org until multi-org switching exists. */
  findFirstByUser(userId: string): Promise<MemberRecord | null>;
  findByUser(
    userId: string,
    organisationId: string,
  ): Promise<MemberRecord | null>;
  listByOrganisation(organisationId: string): Promise<MemberRecord[]>;
  upsert(input: UpsertMemberInput): Promise<MemberRecord>;
  updateRole(id: string, organisationId: string, role: Role): Promise<void>;
  deleteById(id: string, organisationId: string): Promise<void>;
  deleteByUser(userId: string, organisationId: string): Promise<void>;
}

export interface InvitationRecord {
  id: string;
  organisationId: string;
  email: string;
  role: Role;
  status: InvitationStatus;
}

export interface CreateInvitationInput {
  organisationId: string;
  email: string;
  role: Role;
  token: string;
}

export interface IInvitationRepository {
  create(input: CreateInvitationInput): Promise<InvitationRecord>;
  listByOrganisation(organisationId: string): Promise<InvitationRecord[]>;
  findByToken(token: string): Promise<InvitationRecord | null>;
  markAccepted(id: string): Promise<void>;
  /** Reissue an invite with a fresh token (resend); keeps it PENDING. */
  setToken(id: string, organisationId: string, token: string): Promise<void>;
  deleteById(id: string, organisationId: string): Promise<void>;
}

export interface ChannelRecord {
  id: string;
  organisationId: string;
  kind: ChannelKind;
  displayName: string;
  externalId: string;
  status: ChannelStatus;
  credentials: unknown;
  config: unknown;
  connectedAt: Date | null;
}

export interface CreateChannelInput {
  organisationId: string;
  kind: ChannelKind;
  displayName: string;
  externalId: string;
  credentials: unknown;
  config?: unknown;
}

export interface IChannelRepository {
  create(input: CreateChannelInput): Promise<ChannelRecord>;
  findById(id: string, organisationId: string): Promise<ChannelRecord | null>;
  findByExternalId(
    kind: ChannelKind,
    externalId: string,
  ): Promise<ChannelRecord | null>;
  listByOrganisation(organisationId: string): Promise<ChannelRecord[]>;
  setStatus(
    id: string,
    organisationId: string,
    status: ChannelStatus,
    lastError?: string | null,
  ): Promise<void>;
  delete(id: string, organisationId: string): Promise<void>;
}

export interface ContactRecord {
  id: string;
  organisationId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  externalIdentifier: string;
  attributes: Record<string, unknown>;
  shopifyCustomerId: string | null;
}

export interface UpsertContactInput {
  organisationId: string;
  externalIdentifier: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface IContactRepository {
  upsert(input: UpsertContactInput): Promise<ContactRecord>;
  findById(id: string, organisationId: string): Promise<ContactRecord | null>;
}

export interface ConversationRecord {
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
}

export interface CreateConversationInput {
  organisationId: string;
  contactId: string;
  channelId: string;
  subject?: string | null;
  initialLastMessageAt: Date;
}

export interface IConversationRepository {
  create(input: CreateConversationInput): Promise<ConversationRecord>;
  findById(
    id: string,
    organisationId: string,
  ): Promise<ConversationRecord | null>;
  findLatestForContact(
    organisationId: string,
    contactId: string,
    channelId: string,
  ): Promise<ConversationRecord | null>;
  listByOrganisation(input: {
    organisationId: string;
    status?: ConversationStatus | ConversationStatus[];
    assigneeId?: string | null;
    channelId?: string;
    limit?: number;
  }): Promise<ConversationRecord[]>;
  setStatus(
    id: string,
    organisationId: string,
    status: ConversationStatus,
    extra?: { assigneeId?: string | null; resolvedAt?: Date | null },
  ): Promise<void>;
  touchLastMessageAt(
    id: string,
    organisationId: string,
    when: Date,
  ): Promise<void>;
}

export interface MessageRecord {
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
}

export interface CreateMessageInput {
  organisationId: string;
  conversationId: string;
  direction: MessageDirection;
  author: MessageAuthor;
  authorMemberId?: string | null;
  body: string;
  richContent?: unknown;
  channelMessageId?: string | null;
  replyToMessageId?: string | null;
  deliveryStatus?: MessageDeliveryStatus;
  sentAt?: Date;
  attachments?: Array<{
    kind: AttachmentKind;
    url: string;
    mimeType?: string | null;
    fileName?: string | null;
    sizeBytes?: number | null;
  }>;
}

export interface IMessageRepository {
  create(input: CreateMessageInput): Promise<MessageRecord>;
  findByChannelMessageId(
    organisationId: string,
    channelMessageId: string,
  ): Promise<MessageRecord | null>;
  listByConversation(
    organisationId: string,
    conversationId: string,
  ): Promise<MessageRecord[]>;
  setDeliveryStatus(
    organisationId: string,
    channelMessageId: string,
    status: MessageDeliveryStatus,
    extra?: { failureReason?: string; deliveredAt?: Date; readAt?: Date },
  ): Promise<void>;
}

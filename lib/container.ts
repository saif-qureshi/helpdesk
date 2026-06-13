import { prisma } from "@/lib/infra/db";
import { PrismaOrganisationRepository } from "@/lib/repositories/organisation.repository";
import { PrismaMemberRepository } from "@/lib/repositories/member.repository";
import { PrismaInvitationRepository } from "@/lib/repositories/invitation.repository";
import { PrismaUserRepository } from "@/lib/repositories/user.repository";
import { PrismaSessionRepository } from "@/lib/repositories/session.repository";
import { PrismaVerificationTokenRepository } from "@/lib/repositories/verification-token.repository";
import { PrismaChannelRepository } from "@/lib/repositories/channel.repository";
import { PrismaContactRepository } from "@/lib/repositories/contact.repository";
import { PrismaConversationRepository } from "@/lib/repositories/conversation.repository";
import { PrismaMessageRepository } from "@/lib/repositories/message.repository";
import { OnboardingService } from "@/lib/services/onboarding.service";
import { InvitationService } from "@/lib/services/invitation.service";
import { AuthService } from "@/lib/services/auth.service";
import { ContactService } from "@/lib/services/contact.service";
import { ConversationService } from "@/lib/services/conversation.service";
import type { ChannelKind } from "@/generated/prisma/enums";
import type { IChannelProvider } from "@/lib/core/channels";

export const organisationRepository = new PrismaOrganisationRepository(prisma);
export const memberRepository = new PrismaMemberRepository(prisma);
export const invitationRepository = new PrismaInvitationRepository(prisma);
export const userRepository = new PrismaUserRepository(prisma);
export const sessionRepository = new PrismaSessionRepository(prisma);
export const verificationTokenRepository =
  new PrismaVerificationTokenRepository(prisma);

export const channelRepository = new PrismaChannelRepository(prisma);
export const contactRepository = new PrismaContactRepository(prisma);
export const conversationRepository = new PrismaConversationRepository(prisma);
export const messageRepository = new PrismaMessageRepository(prisma);

export const authService = new AuthService(
  userRepository,
  sessionRepository,
  verificationTokenRepository,
);
export const onboardingService = new OnboardingService(
  organisationRepository,
  memberRepository,
  invitationRepository,
);
export const invitationService = new InvitationService(
  invitationRepository,
  memberRepository,
);
export const contactService = new ContactService(contactRepository);
export const conversationService = new ConversationService(
  contactRepository,
  conversationRepository,
  messageRepository,
);

export const channelProviders: Partial<Record<ChannelKind, IChannelProvider>> =
  {};

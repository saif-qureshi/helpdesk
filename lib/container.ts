/**
 * Composition root for data services (Prisma-backed). Route handlers, server
 * components, and worker processors import ready-built services from here.
 * Redis-backed wiring (health) lives with its only consumer, the health route,
 * so importing this never pulls Redis into a page's bundle.
 */
import { prisma } from "@/lib/infra/db";
import { PrismaOrganisationRepository } from "@/lib/repositories/organisation.repository";
import { PrismaMemberRepository } from "@/lib/repositories/member.repository";
import { PrismaInvitationRepository } from "@/lib/repositories/invitation.repository";
import { OnboardingService } from "@/lib/services/onboarding.service";
import { InvitationService } from "@/lib/services/invitation.service";

export const organisationRepository = new PrismaOrganisationRepository(prisma);
export const memberRepository = new PrismaMemberRepository(prisma);
export const invitationRepository = new PrismaInvitationRepository(prisma);

export const onboardingService = new OnboardingService(
  organisationRepository,
  memberRepository,
  invitationRepository,
);
export const invitationService = new InvitationService(
  invitationRepository,
  memberRepository,
);

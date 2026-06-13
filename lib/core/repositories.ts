import type { InvitationStatus, Role } from "@/generated/prisma/enums";

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

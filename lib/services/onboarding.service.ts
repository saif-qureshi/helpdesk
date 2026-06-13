import { Role } from "@/generated/prisma/enums";
import type {
  IInvitationRepository,
  IMemberRepository,
  IOrganisationRepository,
  OrganisationProfile,
  OrganisationRecord,
} from "@/lib/core/repositories";

export interface WorkspaceInvite {
  email: string;
  role: "ADMIN" | "AGENT";
}

export interface CreateWorkspaceInput extends OrganisationProfile {
  userId: string;
  userEmail: string;
  name: string;
  slug: string;
  invites?: WorkspaceInvite[];
}

export class OnboardingService {
  constructor(
    private readonly organisations: IOrganisationRepository,
    private readonly members: IMemberRepository,
    private readonly invitations: IInvitationRepository,
  ) {}

  async createWorkspace(
    input: CreateWorkspaceInput,
  ): Promise<OrganisationRecord> {
    const organisation = await this.organisations.create({
      name: input.name,
      slug: input.slug,
      logoUrl: input.logoUrl,
      industry: input.industry,
      teamSize: input.teamSize,
      defaultLanguage: input.defaultLanguage,
      timezone: input.timezone,
    });

    await this.members.upsert({
      userId: input.userId,
      organisationId: organisation.id,
      role: Role.OWNER,
      email: input.userEmail,
      name: null,
    });

    // Invites are best-effort — a failed invite shouldn't fail onboarding.
    for (const invite of input.invites ?? []) {
      try {
        await this.invitations.create({
          organisationId: organisation.id,
          email: invite.email,
          role: invite.role === "ADMIN" ? Role.ADMIN : Role.AGENT,
          token: crypto.randomUUID(),
        });
      } catch (err) {
        console.error("[onboarding] invite failed", invite.email, err);
      }
    }

    return organisation;
  }
}

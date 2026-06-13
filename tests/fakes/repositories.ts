import type {
  CreateInvitationInput,
  CreateOrganisationInput,
  IInvitationRepository,
  IMemberRepository,
  IOrganisationRepository,
  InvitationRecord,
  MemberRecord,
  OrganisationRecord,
  UpsertMemberInput,
} from "@/lib/core/repositories";

export class InMemoryOrganisationRepository implements IOrganisationRepository {
  readonly orgs: OrganisationRecord[] = [];
  private seq = 0;

  async create(input: CreateOrganisationInput): Promise<OrganisationRecord> {
    const record: OrganisationRecord = {
      id: `org_${++this.seq}`,
      name: input.name,
      slug: input.slug,
      logoUrl: input.logoUrl ?? null,
      industry: input.industry ?? null,
      teamSize: input.teamSize ?? null,
      defaultLanguage: input.defaultLanguage ?? null,
      timezone: input.timezone ?? null,
    };
    this.orgs.push(record);
    return record;
  }

  async findById(id: string): Promise<OrganisationRecord | null> {
    return this.orgs.find((o) => o.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<OrganisationRecord | null> {
    return this.orgs.find((o) => o.slug === slug) ?? null;
  }
}

export class InMemoryMemberRepository implements IMemberRepository {
  members: MemberRecord[] = [];
  private seq = 0;

  async findFirstByClerkUser(clerkUserId: string): Promise<MemberRecord | null> {
    return this.members.find((m) => m.clerkUserId === clerkUserId) ?? null;
  }

  async findByClerkUser(
    clerkUserId: string,
    organisationId: string,
  ): Promise<MemberRecord | null> {
    return (
      this.members.find(
        (m) =>
          m.clerkUserId === clerkUserId && m.organisationId === organisationId,
      ) ?? null
    );
  }

  async listByOrganisation(organisationId: string): Promise<MemberRecord[]> {
    return this.members.filter((m) => m.organisationId === organisationId);
  }

  async upsert(input: UpsertMemberInput): Promise<MemberRecord> {
    const existing = this.members.find(
      (m) =>
        m.clerkUserId === input.clerkUserId &&
        m.organisationId === input.organisationId,
    );
    const record: MemberRecord = {
      id: existing?.id ?? `mem_${++this.seq}`,
      clerkUserId: input.clerkUserId,
      organisationId: input.organisationId,
      role: input.role,
      email: input.email,
      name: input.name ?? null,
    };
    this.members = existing
      ? this.members.map((m) => (m === existing ? record : m))
      : [...this.members, record];
    return record;
  }

  async updateRole(
    id: string,
    organisationId: string,
    role: MemberRecord["role"],
  ): Promise<void> {
    this.members = this.members.map((m) =>
      m.id === id && m.organisationId === organisationId ? { ...m, role } : m,
    );
  }

  async deleteById(id: string, organisationId: string): Promise<void> {
    this.members = this.members.filter(
      (m) => !(m.id === id && m.organisationId === organisationId),
    );
  }

  async deleteByClerkUser(
    clerkUserId: string,
    organisationId: string,
  ): Promise<void> {
    this.members = this.members.filter(
      (m) =>
        !(m.clerkUserId === clerkUserId && m.organisationId === organisationId),
    );
  }
}

export class InMemoryInvitationRepository implements IInvitationRepository {
  readonly invitations: (InvitationRecord & { token: string })[] = [];
  private seq = 0;

  async create(input: CreateInvitationInput): Promise<InvitationRecord> {
    const record = {
      id: `inv_${++this.seq}`,
      organisationId: input.organisationId,
      email: input.email,
      role: input.role,
      status: "PENDING" as const,
      token: input.token,
    };
    this.invitations.push(record);
    return record;
  }

  async listByOrganisation(organisationId: string): Promise<InvitationRecord[]> {
    return this.invitations.filter((i) => i.organisationId === organisationId);
  }

  async findByToken(token: string): Promise<InvitationRecord | null> {
    return this.invitations.find((i) => i.token === token) ?? null;
  }

  async markAccepted(id: string): Promise<void> {
    const inv = this.invitations.find((i) => i.id === id);
    if (inv) inv.status = "ACCEPTED";
  }

  async setToken(
    id: string,
    organisationId: string,
    token: string,
  ): Promise<void> {
    const inv = this.invitations.find(
      (i) => i.id === id && i.organisationId === organisationId,
    );
    if (inv) {
      inv.token = token;
      inv.status = "PENDING";
    }
  }

  async deleteById(id: string, organisationId: string): Promise<void> {
    const idx = this.invitations.findIndex(
      (i) => i.id === id && i.organisationId === organisationId,
    );
    if (idx >= 0) this.invitations.splice(idx, 1);
  }
}

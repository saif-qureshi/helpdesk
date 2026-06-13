import type {
  ContactRecord,
  IContactRepository,
} from "@/lib/core/repositories";

export class ContactService {
  constructor(private readonly contacts: IContactRepository) {}

  async upsertFromChannel(input: {
    organisationId: string;
    externalIdentifier: string;
    displayName?: string;
    email?: string;
    phone?: string;
  }): Promise<ContactRecord> {
    return this.contacts.upsert({
      organisationId: input.organisationId,
      externalIdentifier: input.externalIdentifier,
      name: input.displayName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
    });
  }
}

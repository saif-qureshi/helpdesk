import type { Db } from "@/lib/infra/db";
import type {
  ContactRecord,
  IContactRepository,
  UpsertContactInput,
} from "@/lib/core/repositories";

type Row = {
  id: string;
  organisationId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  externalIdentifier: string;
  attributes: unknown;
  shopifyCustomerId: string | null;
};

export class PrismaContactRepository implements IContactRepository {
  constructor(private readonly db: Db) {}

  async upsert(input: UpsertContactInput): Promise<ContactRecord> {
    const row = await this.db.contact.upsert({
      where: {
        organisationId_externalIdentifier: {
          organisationId: input.organisationId,
          externalIdentifier: input.externalIdentifier,
        },
      },
      create: {
        organisationId: input.organisationId,
        externalIdentifier: input.externalIdentifier,
        name: input.name ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
      },
      update: {
        name: input.name ?? undefined,
        email: input.email ?? undefined,
        phone: input.phone ?? undefined,
      },
    });
    return this.toRecord(row);
  }

  async findById(
    id: string,
    organisationId: string,
  ): Promise<ContactRecord | null> {
    const row = await this.db.contact.findFirst({
      where: { id, organisationId },
    });
    return row && this.toRecord(row);
  }

  private toRecord(row: Row): ContactRecord {
    return {
      id: row.id,
      organisationId: row.organisationId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      externalIdentifier: row.externalIdentifier,
      attributes: (row.attributes as Record<string, unknown>) ?? {},
      shopifyCustomerId: row.shopifyCustomerId,
    };
  }
}

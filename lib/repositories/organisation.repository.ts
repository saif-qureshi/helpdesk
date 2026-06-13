import type { Db } from "@/lib/infra/db";
import type {
  CreateOrganisationInput,
  IOrganisationRepository,
  OrganisationRecord,
} from "@/lib/core/repositories";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  industry: string | null;
  teamSize: string | null;
  defaultLanguage: string | null;
  timezone: string | null;
};

export class PrismaOrganisationRepository implements IOrganisationRepository {
  constructor(private readonly db: Db) {}

  async create(input: CreateOrganisationInput): Promise<OrganisationRecord> {
    const row = await this.db.organisation.create({
      data: {
        name: input.name,
        slug: input.slug,
        logoUrl: input.logoUrl ?? null,
        industry: input.industry ?? null,
        teamSize: input.teamSize ?? null,
        defaultLanguage: input.defaultLanguage ?? null,
        timezone: input.timezone ?? null,
      },
    });
    return this.toRecord(row);
  }

  async findById(id: string): Promise<OrganisationRecord | null> {
    const row = await this.db.organisation.findUnique({ where: { id } });
    return row && this.toRecord(row);
  }

  async findBySlug(slug: string): Promise<OrganisationRecord | null> {
    const row = await this.db.organisation.findUnique({ where: { slug } });
    return row && this.toRecord(row);
  }

  private toRecord(row: OrgRow): OrganisationRecord {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl,
      industry: row.industry,
      teamSize: row.teamSize,
      defaultLanguage: row.defaultLanguage,
      timezone: row.timezone,
    };
  }
}

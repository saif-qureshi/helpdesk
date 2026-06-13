import type { Db } from "@/lib/infra/db";
import type {
  CreateUserInput,
  IUserRepository,
  UserRecord,
} from "@/lib/core/auth";

type Row = {
  id: string;
  email: string;
  emailVerified: boolean;
  passwordHash: string | null;
  googleId: string | null;
  name: string | null;
  image: string | null;
  createdAt: Date;
};

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: Db) {}

  async create(input: CreateUserInput): Promise<UserRecord> {
    const row = await this.db.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash ?? null,
        googleId: input.googleId ?? null,
        name: input.name ?? null,
        image: input.image ?? null,
        emailVerified: input.emailVerified ?? false,
      },
    });
    return this.toRecord(row);
  }

  async findById(id: string): Promise<UserRecord | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row && this.toRecord(row);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return row && this.toRecord(row);
  }

  async findByGoogleId(googleId: string): Promise<UserRecord | null> {
    const row = await this.db.user.findUnique({ where: { googleId } });
    return row && this.toRecord(row);
  }

  async setPasswordHash(id: string, hash: string): Promise<void> {
    await this.db.user.update({
      where: { id },
      data: { passwordHash: hash },
    });
  }

  async setGoogleId(id: string, googleId: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { googleId } });
  }

  async markEmailVerified(id: string): Promise<void> {
    await this.db.user.update({
      where: { id },
      data: { emailVerified: true },
    });
  }

  async updateProfile(
    id: string,
    input: { name?: string | null; image?: string | null },
  ): Promise<void> {
    await this.db.user.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.image !== undefined ? { image: input.image } : {}),
      },
    });
  }

  private toRecord(row: Row): UserRecord {
    return {
      id: row.id,
      email: row.email,
      emailVerified: row.emailVerified,
      passwordHash: row.passwordHash,
      googleId: row.googleId,
      name: row.name,
      image: row.image,
      createdAt: row.createdAt,
    };
  }
}

import { randomBytes } from "node:crypto";
import type { Db } from "@/lib/infra/db";
import type { VerificationTokenType } from "@/generated/prisma/enums";
import type {
  IVerificationTokenRepository,
  VerificationTokenRecord,
} from "@/lib/core/auth";

function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export class PrismaVerificationTokenRepository
  implements IVerificationTokenRepository
{
  constructor(private readonly db: Db) {}

  async create(
    userId: string,
    type: VerificationTokenType,
    expiresAt: Date,
  ): Promise<VerificationTokenRecord> {
    const row = await this.db.verificationToken.create({
      data: { userId, type, expiresAt, token: randomToken() },
    });
    return {
      id: row.id,
      userId: row.userId,
      token: row.token,
      type: row.type,
      expiresAt: row.expiresAt,
    };
  }

  async findByToken(token: string): Promise<VerificationTokenRecord | null> {
    const row = await this.db.verificationToken.findUnique({
      where: { token },
    });
    return (
      row && {
        id: row.id,
        userId: row.userId,
        token: row.token,
        type: row.type,
        expiresAt: row.expiresAt,
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.verificationToken.deleteMany({ where: { id } });
  }

  async deleteAllForUser(
    userId: string,
    type: VerificationTokenType,
  ): Promise<void> {
    await this.db.verificationToken.deleteMany({ where: { userId, type } });
  }
}

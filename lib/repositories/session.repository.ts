import type { Db } from "@/lib/infra/db";
import type { ISessionRepository, SessionRecord } from "@/lib/core/auth";

export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly db: Db) {}

  async create(userId: string, expiresAt: Date): Promise<SessionRecord> {
    const row = await this.db.session.create({
      data: { userId, expiresAt },
    });
    return { id: row.id, userId: row.userId, expiresAt: row.expiresAt };
  }

  async findById(id: string): Promise<SessionRecord | null> {
    const row = await this.db.session.findUnique({ where: { id } });
    return row && { id: row.id, userId: row.userId, expiresAt: row.expiresAt };
  }

  async extend(id: string, expiresAt: Date): Promise<void> {
    await this.db.session.update({ where: { id }, data: { expiresAt } });
  }

  async delete(id: string): Promise<void> {
    await this.db.session.deleteMany({ where: { id } });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.db.session.deleteMany({ where: { userId } });
  }
}

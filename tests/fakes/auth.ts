import { randomUUID } from "node:crypto";
import type { VerificationTokenType } from "@/generated/prisma/enums";
import type {
  CreateUserInput,
  ISessionRepository,
  IUserRepository,
  IVerificationTokenRepository,
  SessionRecord,
  UserRecord,
  VerificationTokenRecord,
} from "@/lib/core/auth";

export class InMemoryUserRepository implements IUserRepository {
  readonly users: UserRecord[] = [];
  private seq = 0;

  async create(input: CreateUserInput): Promise<UserRecord> {
    const record: UserRecord = {
      id: `user_${++this.seq}`,
      email: input.email.toLowerCase(),
      emailVerified: input.emailVerified ?? false,
      passwordHash: input.passwordHash ?? null,
      googleId: input.googleId ?? null,
      name: input.name ?? null,
      image: input.image ?? null,
      createdAt: new Date(),
    };
    this.users.push(record);
    return record;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.email === email.toLowerCase()) ?? null;
  }

  async findByGoogleId(googleId: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.googleId === googleId) ?? null;
  }

  async setPasswordHash(id: string, hash: string): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (user) user.passwordHash = hash;
  }

  async setGoogleId(id: string, googleId: string): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (user) user.googleId = googleId;
  }

  async markEmailVerified(id: string): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (user) user.emailVerified = true;
  }

  async updateProfile(
    id: string,
    input: { name?: string | null; image?: string | null },
  ): Promise<void> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return;
    if (input.name !== undefined) user.name = input.name;
    if (input.image !== undefined) user.image = input.image;
  }
}

export class InMemorySessionRepository implements ISessionRepository {
  readonly sessions: SessionRecord[] = [];

  async create(userId: string, expiresAt: Date): Promise<SessionRecord> {
    const record = { id: `sess_${randomUUID()}`, userId, expiresAt };
    this.sessions.push(record);
    return record;
  }

  async findById(id: string): Promise<SessionRecord | null> {
    return this.sessions.find((s) => s.id === id) ?? null;
  }

  async extend(id: string, expiresAt: Date): Promise<void> {
    const session = this.sessions.find((s) => s.id === id);
    if (session) session.expiresAt = expiresAt;
  }

  async delete(id: string): Promise<void> {
    const idx = this.sessions.findIndex((s) => s.id === id);
    if (idx >= 0) this.sessions.splice(idx, 1);
  }

  async deleteAllForUser(userId: string): Promise<void> {
    for (let i = this.sessions.length - 1; i >= 0; i--) {
      if (this.sessions[i]!.userId === userId) this.sessions.splice(i, 1);
    }
  }
}

export class InMemoryVerificationTokenRepository
  implements IVerificationTokenRepository
{
  readonly tokens: VerificationTokenRecord[] = [];
  private seq = 0;

  async create(
    userId: string,
    type: VerificationTokenType,
    expiresAt: Date,
  ): Promise<VerificationTokenRecord> {
    const record: VerificationTokenRecord = {
      id: `vt_${++this.seq}`,
      userId,
      token: randomUUID(),
      type,
      expiresAt,
    };
    this.tokens.push(record);
    return record;
  }

  async findByToken(token: string): Promise<VerificationTokenRecord | null> {
    return this.tokens.find((t) => t.token === token) ?? null;
  }

  async delete(id: string): Promise<void> {
    const idx = this.tokens.findIndex((t) => t.id === id);
    if (idx >= 0) this.tokens.splice(idx, 1);
  }

  async deleteAllForUser(
    userId: string,
    type: VerificationTokenType,
  ): Promise<void> {
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const t = this.tokens[i]!;
      if (t.userId === userId && t.type === type) this.tokens.splice(i, 1);
    }
  }
}

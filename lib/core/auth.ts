import type { VerificationTokenType } from "@/generated/prisma/enums";

export interface UserRecord {
  id: string;
  email: string;
  emailVerified: boolean;
  passwordHash: string | null;
  googleId: string | null;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  passwordHash?: string | null;
  googleId?: string | null;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
}

export interface IUserRepository {
  create(input: CreateUserInput): Promise<UserRecord>;
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByGoogleId(googleId: string): Promise<UserRecord | null>;
  setPasswordHash(id: string, hash: string): Promise<void>;
  setGoogleId(id: string, googleId: string): Promise<void>;
  markEmailVerified(id: string): Promise<void>;
  updateProfile(
    id: string,
    input: { name?: string | null; image?: string | null },
  ): Promise<void>;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface ISessionRepository {
  create(userId: string, expiresAt: Date): Promise<SessionRecord>;
  findById(id: string): Promise<SessionRecord | null>;
  extend(id: string, expiresAt: Date): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}

export interface VerificationTokenRecord {
  id: string;
  userId: string;
  token: string;
  type: VerificationTokenType;
  expiresAt: Date;
}

export interface IVerificationTokenRepository {
  create(
    userId: string,
    type: VerificationTokenType,
    expiresAt: Date,
  ): Promise<VerificationTokenRecord>;
  findByToken(token: string): Promise<VerificationTokenRecord | null>;
  delete(id: string): Promise<void>;
  deleteAllForUser(
    userId: string,
    type: VerificationTokenType,
  ): Promise<void>;
}

import { hash, verify } from "@node-rs/argon2";
import { VerificationTokenType } from "@/generated/prisma/enums";
import { env } from "@/lib/env";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/core/errors";
import type {
  ISessionRepository,
  IUserRepository,
  IVerificationTokenRepository,
  SessionRecord,
  UserRecord,
} from "@/lib/core/auth";

const SESSION_HOURS = 24;
const SESSION_REFRESH_HOURS = 12;
const EMAIL_VERIFY_HOURS = 24;
const PASSWORD_RESET_HOURS = 1;
const MIN_PASSWORD_LENGTH = 8;

const BAD_CREDENTIALS = "Invalid email or password.";

type AuthResult = { user: UserRecord; session: SessionRecord };

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly sessions: ISessionRepository,
    private readonly tokens: IVerificationTokenRepository,
  ) {}

  async signUp(input: {
    email: string;
    password: string;
    name?: string | null;
  }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    this.assertPasswordPolicy(input.password);

    if (await this.users.findByEmail(email)) {
      throw new ValidationError("An account with this email already exists.");
    }

    const passwordHash = await hash(input.password);
    const user = await this.users.create({
      email,
      passwordHash,
      name: input.name?.trim() || null,
      emailVerified: false,
    });
    await this.issueEmailVerifyToken(user);
    const session = await this.startSession(user.id);
    return { user, session };
  }

  async signIn(input: {
    email: string;
    password: string;
  }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError(BAD_CREDENTIALS);
    }
    const ok = await verify(user.passwordHash, input.password);
    if (!ok) throw new UnauthorizedError(BAD_CREDENTIALS);

    const session = await this.startSession(user.id);
    return { user, session };
  }

  async signOut(sessionId: string): Promise<void> {
    await this.sessions.delete(sessionId);
  }

  async getSession(sessionId: string): Promise<AuthResult | null> {
    const session = await this.sessions.findById(sessionId);
    if (!session) return null;

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessions.delete(session.id);
      return null;
    }

    const refreshThreshold =
      Date.now() + SESSION_REFRESH_HOURS * 60 * 60 * 1000;
    let refreshed = session;
    if (session.expiresAt.getTime() < refreshThreshold) {
      const expiresAt = this.hoursFromNow(SESSION_HOURS);
      await this.sessions.extend(session.id, expiresAt);
      refreshed = { ...session, expiresAt };
    }

    const user = await this.users.findById(session.userId);
    if (!user) {
      await this.sessions.delete(session.id);
      return null;
    }
    return { user, session: refreshed };
  }

  async loginWithGoogle(profile: {
    googleId: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }): Promise<AuthResult> {
    const email = profile.email.trim().toLowerCase();
    let user = await this.users.findByGoogleId(profile.googleId);
    if (!user) {
      const byEmail = await this.users.findByEmail(email);
      if (byEmail) {
        await this.users.setGoogleId(byEmail.id, profile.googleId);
        if (!byEmail.emailVerified) {
          await this.users.markEmailVerified(byEmail.id);
        }
        user = { ...byEmail, googleId: profile.googleId, emailVerified: true };
      } else {
        user = await this.users.create({
          email,
          googleId: profile.googleId,
          name: profile.name ?? null,
          image: profile.image ?? null,
          emailVerified: true,
        });
      }
    }
    const session = await this.startSession(user.id);
    return { user, session };
  }

  async verifyEmail(token: string): Promise<void> {
    const record = await this.tokens.findByToken(token);
    if (
      !record ||
      record.type !== VerificationTokenType.EMAIL_VERIFY ||
      record.expiresAt.getTime() <= Date.now()
    ) {
      if (record) await this.tokens.delete(record.id);
      throw new NotFoundError(
        "This verification link is invalid or has expired.",
      );
    }
    await this.users.markEmailVerified(record.userId);
    await this.tokens.deleteAllForUser(
      record.userId,
      VerificationTokenType.EMAIL_VERIFY,
    );
  }

  async resendEmailVerification(userId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user || user.emailVerified) return;
    await this.tokens.deleteAllForUser(
      userId,
      VerificationTokenType.EMAIL_VERIFY,
    );
    await this.issueEmailVerifyToken(user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user) return;
    await this.tokens.deleteAllForUser(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
    );
    const token = await this.tokens.create(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
      this.hoursFromNow(PASSWORD_RESET_HOURS),
    );
    this.logLink(
      "password-reset",
      user.email,
      `${env.NEXT_PUBLIC_APP_URL}/reset-password/${token.token}`,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.assertPasswordPolicy(newPassword);
    const record = await this.tokens.findByToken(token);
    if (
      !record ||
      record.type !== VerificationTokenType.PASSWORD_RESET ||
      record.expiresAt.getTime() <= Date.now()
    ) {
      if (record) await this.tokens.delete(record.id);
      throw new NotFoundError("This reset link is invalid or has expired.");
    }
    const passwordHash = await hash(newPassword);
    await this.users.setPasswordHash(record.userId, passwordHash);
    await this.tokens.deleteAllForUser(
      record.userId,
      VerificationTokenType.PASSWORD_RESET,
    );
    await this.sessions.deleteAllForUser(record.userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    this.assertPasswordPolicy(newPassword);
    const user = await this.users.findById(userId);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("No password set for this account.");
    }
    const ok = await verify(user.passwordHash, currentPassword);
    if (!ok) throw new UnauthorizedError("Current password is incorrect.");
    const passwordHash = await hash(newPassword);
    await this.users.setPasswordHash(userId, passwordHash);
  }

  private async issueEmailVerifyToken(user: UserRecord): Promise<void> {
    const token = await this.tokens.create(
      user.id,
      VerificationTokenType.EMAIL_VERIFY,
      this.hoursFromNow(EMAIL_VERIFY_HOURS),
    );
    this.logLink(
      "email-verify",
      user.email,
      `${env.NEXT_PUBLIC_APP_URL}/verify-email/${token.token}`,
    );
  }

  private startSession(userId: string): Promise<SessionRecord> {
    return this.sessions.create(userId, this.hoursFromNow(SESSION_HOURS));
  }

  private assertPasswordPolicy(password: string): void {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
    }
  }

  private hoursFromNow(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  // Phase 2 swaps this for Postmark email delivery.
  private logLink(
    kind: "email-verify" | "password-reset",
    email: string,
    url: string,
  ): void {
    console.log(`[auth] ${kind} link for ${email}: ${url}`);
  }
}

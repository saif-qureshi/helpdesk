import { describe, it, expect } from "vitest";
import { VerificationTokenType } from "@/generated/prisma/enums";
import { AuthService } from "@/lib/services/auth.service";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/core/errors";
import {
  InMemorySessionRepository,
  InMemoryUserRepository,
  InMemoryVerificationTokenRepository,
} from "./fakes/auth";

function setup() {
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  const tokens = new InMemoryVerificationTokenRepository();
  const service = new AuthService(users, sessions, tokens);
  return { users, sessions, tokens, service };
}

describe("AuthService.signUp", () => {
  it("creates an unverified user, a session, and an EMAIL_VERIFY token", async () => {
    const { users, sessions, tokens, service } = setup();

    const { user, session } = await service.signUp({
      email: "a@example.com",
      password: "supersecret",
      name: "Ada",
    });

    expect(user.email).toBe("a@example.com");
    expect(user.emailVerified).toBe(false);
    expect(user.passwordHash).toBeTruthy();
    expect(users.users).toHaveLength(1);
    expect(sessions.sessions).toContainEqual(session);
    expect(
      tokens.tokens.find(
        (t) => t.userId === user.id && t.type === VerificationTokenType.EMAIL_VERIFY,
      ),
    ).toBeTruthy();
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const { service } = setup();
    await expect(
      service.signUp({ email: "b@example.com", password: "short" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects a duplicate email", async () => {
    const { service } = setup();
    await service.signUp({ email: "c@example.com", password: "supersecret" });
    await expect(
      service.signUp({ email: "C@example.com", password: "supersecret" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("AuthService.signIn", () => {
  it("returns a session when credentials match", async () => {
    const { service } = setup();
    await service.signUp({ email: "d@example.com", password: "supersecret" });
    const { user, session } = await service.signIn({
      email: "D@example.com",
      password: "supersecret",
    });
    expect(user.email).toBe("d@example.com");
    expect(session.id).toBeTruthy();
  });

  it("rejects wrong password with the same error as unknown email", async () => {
    const { service } = setup();
    await service.signUp({ email: "e@example.com", password: "supersecret" });

    const wrongPassword = service
      .signIn({ email: "e@example.com", password: "wrongwrong" })
      .catch((err) => err);
    const unknownEmail = service
      .signIn({ email: "missing@example.com", password: "whatever" })
      .catch((err) => err);

    const [a, b] = await Promise.all([wrongPassword, unknownEmail]);
    expect(a).toBeInstanceOf(UnauthorizedError);
    expect(b).toBeInstanceOf(UnauthorizedError);
    expect(a.message).toBe(b.message);
  });
});

describe("AuthService.getSession", () => {
  it("returns user + session for a live session", async () => {
    const { service } = setup();
    const { session } = await service.signUp({
      email: "f@example.com",
      password: "supersecret",
    });
    const result = await service.getSession(session.id);
    expect(result?.user.email).toBe("f@example.com");
  });

  it("returns null and deletes an expired session", async () => {
    const { sessions, service } = setup();
    const { user } = await service.signUp({
      email: "g@example.com",
      password: "supersecret",
    });
    const expired = await sessions.create(user.id, new Date(Date.now() - 1000));
    const result = await service.getSession(expired.id);
    expect(result).toBeNull();
    expect(sessions.sessions.find((s) => s.id === expired.id)).toBeUndefined();
  });
});

describe("AuthService.signOut", () => {
  it("removes the session", async () => {
    const { sessions, service } = setup();
    const { session } = await service.signUp({
      email: "h@example.com",
      password: "supersecret",
    });
    await service.signOut(session.id);
    expect(sessions.sessions.find((s) => s.id === session.id)).toBeUndefined();
  });
});

describe("AuthService.verifyEmail", () => {
  it("marks the user verified and consumes EMAIL_VERIFY tokens", async () => {
    const { tokens, users, service } = setup();
    const { user } = await service.signUp({
      email: "i@example.com",
      password: "supersecret",
    });
    const t = tokens.tokens.find((x) => x.userId === user.id)!;
    await service.verifyEmail(t.token);
    expect(users.users.find((u) => u.id === user.id)?.emailVerified).toBe(true);
    expect(tokens.tokens.filter((x) => x.userId === user.id)).toHaveLength(0);
  });

  it("throws NotFoundError for an unknown token", async () => {
    const { service } = setup();
    await expect(service.verifyEmail("nope")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe("AuthService.resetPassword", () => {
  it("updates the hash and invalidates all sessions", async () => {
    const { sessions, tokens, service } = setup();
    const { user, session } = await service.signUp({
      email: "j@example.com",
      password: "supersecret",
    });
    await service.requestPasswordReset(user.email);
    const t = tokens.tokens.find(
      (x) => x.userId === user.id && x.type === VerificationTokenType.PASSWORD_RESET,
    )!;
    await service.resetPassword(t.token, "newpassword");

    expect(sessions.sessions.find((s) => s.id === session.id)).toBeUndefined();
    const { user: signed } = await service.signIn({
      email: "j@example.com",
      password: "newpassword",
    });
    expect(signed.id).toBe(user.id);
  });

  it("silently no-ops for unknown emails", async () => {
    const { tokens, service } = setup();
    await service.requestPasswordReset("ghost@example.com");
    expect(tokens.tokens).toHaveLength(0);
  });
});

describe("AuthService.loginWithGoogle", () => {
  it("links Google to an existing email-password account", async () => {
    const { users, service } = setup();
    const { user } = await service.signUp({
      email: "k@example.com",
      password: "supersecret",
    });
    expect(user.emailVerified).toBe(false);

    const linked = await service.loginWithGoogle({
      googleId: "g-123",
      email: "K@example.com",
      name: "Kay",
    });

    expect(linked.user.id).toBe(user.id);
    expect(users.users.find((u) => u.id === user.id)?.googleId).toBe("g-123");
    expect(users.users.find((u) => u.id === user.id)?.emailVerified).toBe(true);
  });

  it("creates a fresh verified user when nothing matches", async () => {
    const { users, service } = setup();
    const result = await service.loginWithGoogle({
      googleId: "g-999",
      email: "fresh@example.com",
      name: "Fresh",
    });
    expect(users.users).toHaveLength(1);
    expect(result.user.emailVerified).toBe(true);
    expect(result.user.passwordHash).toBeNull();
  });
});

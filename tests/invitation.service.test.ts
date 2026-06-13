import { describe, it, expect } from "vitest";
import { Role } from "@/generated/prisma/enums";
import { InvitationService } from "@/lib/services/invitation.service";
import { NotFoundError } from "@/lib/core/errors";
import {
  InMemoryInvitationRepository,
  InMemoryMemberRepository,
} from "./fakes/repositories";

function setup() {
  const invitations = new InMemoryInvitationRepository();
  const members = new InMemoryMemberRepository();
  const service = new InvitationService(invitations, members);
  return { invitations, members, service };
}

describe("InvitationService.accept", () => {
  it("adds the user as a member and marks the invite accepted", async () => {
    const { invitations, members, service } = setup();
    await invitations.create({
      organisationId: "org_1",
      email: "a@acme.com",
      role: Role.AGENT,
      token: "tok-1",
    });

    const res = await service.accept({
      token: "tok-1",
      userId: "user_9",
      email: "a@acme.com",
    });

    expect(res.organisationId).toBe("org_1");
    expect(await members.findByUser("user_9", "org_1")).toMatchObject({
      role: Role.AGENT,
    });
    expect((await invitations.findByToken("tok-1"))?.status).toBe("ACCEPTED");
  });

  it("rejects an unknown token", async () => {
    const { service } = setup();
    await expect(
      service.accept({ token: "nope", userId: "u", email: "e@e.com" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects an already-accepted invitation", async () => {
    const { invitations, service } = setup();
    await invitations.create({
      organisationId: "org_1",
      email: "a@acme.com",
      role: Role.AGENT,
      token: "tok-2",
    });
    await service.accept({ token: "tok-2", userId: "u1", email: "a@acme.com" });

    await expect(
      service.accept({ token: "tok-2", userId: "u2", email: "a@acme.com" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

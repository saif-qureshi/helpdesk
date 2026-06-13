import { describe, it, expect } from "vitest";
import { Role } from "@/generated/prisma/enums";
import { OnboardingService } from "@/lib/services/onboarding.service";
import {
  InMemoryInvitationRepository,
  InMemoryMemberRepository,
  InMemoryOrganisationRepository,
} from "./fakes/repositories";

function setup() {
  const orgs = new InMemoryOrganisationRepository();
  const members = new InMemoryMemberRepository();
  const invitations = new InMemoryInvitationRepository();
  const service = new OnboardingService(orgs, members, invitations);
  return { orgs, members, invitations, service };
}

describe("OnboardingService.createWorkspace", () => {
  it("creates the org with its profile and makes the creator OWNER", async () => {
    const { orgs, members, service } = setup();

    const org = await service.createWorkspace({
      userId: "user_1",
      userEmail: "founder@acme.com",
      name: "Acme",
      slug: "acme",
      industry: "SaaS",
      teamSize: "2-10",
    });

    expect(orgs.orgs).toHaveLength(1);
    expect(org).toMatchObject({ name: "Acme", slug: "acme", industry: "SaaS" });

    const member = await members.findFirstByUser("user_1");
    expect(member).toMatchObject({
      organisationId: org.id,
      role: Role.OWNER,
      email: "founder@acme.com",
    });
  });

  it("creates pending invitations with mapped roles", async () => {
    const { invitations, service } = setup();

    const org = await service.createWorkspace({
      userId: "user_1",
      userEmail: "founder@acme.com",
      name: "Acme",
      slug: "acme",
      invites: [
        { email: "admin@acme.com", role: "ADMIN" },
        { email: "agent@acme.com", role: "AGENT" },
      ],
    });

    const list = await invitations.listByOrganisation(org.id);
    expect(list).toHaveLength(2);
    expect(list.find((i) => i.email === "admin@acme.com")?.role).toBe(Role.ADMIN);
    expect(list.find((i) => i.email === "agent@acme.com")?.role).toBe(Role.AGENT);
  });
});

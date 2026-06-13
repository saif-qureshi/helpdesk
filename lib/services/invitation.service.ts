import { NotFoundError } from "@/lib/core/errors";
import type {
  IInvitationRepository,
  IMemberRepository,
} from "@/lib/core/repositories";

export class InvitationService {
  constructor(
    private readonly invitations: IInvitationRepository,
    private readonly members: IMemberRepository,
  ) {}

  async accept(input: {
    token: string;
    userId: string;
    email: string;
  }): Promise<{ organisationId: string }> {
    const invitation = await this.invitations.findByToken(input.token);
    if (!invitation || invitation.status !== "PENDING") {
      throw new NotFoundError("This invitation is invalid or already used.");
    }

    await this.members.upsert({
      userId: input.userId,
      organisationId: invitation.organisationId,
      role: invitation.role,
      email: input.email,
    });
    await this.invitations.markAccepted(invitation.id);

    return { organisationId: invitation.organisationId };
  }
}

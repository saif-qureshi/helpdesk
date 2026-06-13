import { Users } from "lucide-react";
import { Role } from "@/generated/prisma/enums";
import { requireOrg } from "@/lib/auth/tenant";
import { hasAtLeast } from "@/lib/auth/roles";
import { invitationRepository, memberRepository } from "@/lib/container";
import { EmptyState } from "@/components/shared/empty-state";
import { SettingsHeader } from "@/components/settings/page-header";
import { TeamView } from "./team-view";

export default async function TeamPage() {
  let ctx;
  try {
    ctx = await requireOrg();
  } catch {
    return (
      <NotReady note="Create your workspace in onboarding to manage your team." />
    );
  }

  const [members, invitations] = await Promise.all([
    memberRepository.listByOrganisation(ctx.organisationId),
    invitationRepository.listByOrganisation(ctx.organisationId),
  ]);

  return (
    <TeamView
      members={members}
      invitations={invitations}
      currentUserId={ctx.userId}
      canManage={hasAtLeast(ctx.role, Role.ADMIN)}
    />
  );
}

function NotReady({ note }: { note: string }) {
  return (
    <div className="min-h-full">
      <SettingsHeader
        title="Team & roles"
        sub="Manage who can access this workspace and what they can do."
      />
      <EmptyState icon={Users} title="No workspace yet" description={note} />
    </div>
  );
}

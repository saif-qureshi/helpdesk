import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { memberRepository, organisationRepository } from "@/lib/container";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/sonner";
import { VerifyEmailBanner } from "./verify-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const member = await memberRepository.findFirstByUser(user.id);
  if (!member) redirect("/onboarding");

  const org = await organisationRepository.findById(member.organisationId);
  const workspaceName = org?.name ?? "Workspace";
  const workspaceLogoUrl = org?.logoUrl ?? null;

  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar workspaceName={workspaceName} workspaceLogoUrl={workspaceLogoUrl} />
      <div className="flex min-w-0 flex-1 flex-col">
        {user.emailVerified ? null : <VerifyEmailBanner email={user.email} />}
        <Topbar
          user={{ name: user.name, email: user.email, image: user.image }}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}

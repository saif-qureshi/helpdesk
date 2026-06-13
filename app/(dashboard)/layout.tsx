import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import { memberRepository, organisationRepository } from "@/lib/container";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/sonner";

async function resolveWorkspace(): Promise<{
  name: string;
  logoUrl: string | null;
}> {
  if (!isClerkConfigured) return { name: "Northwind", logoUrl: null };

  const { userId } = await auth();
  if (!userId) return { name: "Workspace", logoUrl: null };

  const member = await memberRepository.findFirstByClerkUser(userId);
  if (!member) return { name: "Personal workspace", logoUrl: null };

  const org = await organisationRepository.findById(member.organisationId);
  return { name: org?.name ?? "Workspace", logoUrl: org?.logoUrl ?? null };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await resolveWorkspace();

  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar
        workspaceName={workspace.name}
        workspaceLogoUrl={workspace.logoUrl}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}

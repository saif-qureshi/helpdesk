import Link from "next/link";
import { redirect } from "next/navigation";
import { invitationService } from "@/lib/container";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/sign-up?returnTo=${encodeURIComponent(`/invite/${params.token}`)}`,
    );
  }

  let accepted = false;
  try {
    await invitationService.accept({
      token: params.token,
      userId: user.id,
      email: user.email,
    });
    accepted = true;
  } catch {
    accepted = false;
  }

  if (accepted) redirect("/tickets");

  return (
    <InviteError message="This invitation is invalid or has already been used." />
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Invitation</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button asChild className="mt-6">
          <Link href="/tickets">Go to dashboard</Link>
        </Button>
      </Card>
    </div>
  );
}

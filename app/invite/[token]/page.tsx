import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import { invitationService } from "@/lib/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  if (!isClerkConfigured) {
    return <InviteError message="Authentication isn't configured yet." />;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-up?redirect_url=${encodeURIComponent(`/invite/${params.token}`)}`);
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) {
    return <InviteError message="Your account has no primary email address." />;
  }

  let accepted = false;
  try {
    await invitationService.accept({
      token: params.token,
      clerkUserId: userId,
      email,
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

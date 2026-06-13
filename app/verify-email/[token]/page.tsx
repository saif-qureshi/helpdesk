import Link from "next/link";
import { redirect } from "next/navigation";
import { authService } from "@/lib/container";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthCard } from "@/app/(auth)/auth-card";

export default async function VerifyEmailPage({
  params,
}: {
  params: { token: string };
}) {
  let ok = false;
  try {
    await authService.verifyEmail(params.token);
    ok = true;
  } catch {
    ok = false;
  }

  if (ok) {
    const user = await getCurrentUser();
    redirect(user ? "/?verified=1" : "/sign-in?verified=1");
  }

  return (
    <AuthCard
      title="Link expired or invalid"
      subtitle="This verification link can't be used. You can request a new one from your account page."
      footer={
        <Link href="/sign-in" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="text-sm text-muted-foreground">
        If you just signed up and didn&rsquo;t see the email, sign in and
        click <span className="font-medium text-foreground">Resend
        verification</span> from your account.
      </div>
    </AuthCard>
  );
}

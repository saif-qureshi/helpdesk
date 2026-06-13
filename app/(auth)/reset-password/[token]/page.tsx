import Link from "next/link";
import { AuthCard } from "../../auth-card";
import { ResetForm } from "./reset-form";

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <AuthCard
      title="Choose a new password"
      subtitle="You'll be signed out of any other devices."
      footer={
        <>
          <Link href="/sign-in" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <ResetForm token={params.token} />
    </AuthCard>
  );
}

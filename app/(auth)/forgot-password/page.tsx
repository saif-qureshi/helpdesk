import Link from "next/link";
import { AuthCard } from "../auth-card";
import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/sign-in" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}

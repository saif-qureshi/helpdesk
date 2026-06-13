import Link from "next/link";
import { AuthCard } from "../auth-card";
import { GoogleButton } from "../google-button";
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { returnTo?: string };
}) {
  const returnTo = searchParams?.returnTo;
  return (
    <AuthCard
      title="Create your account"
      subtitle="Start triaging tickets with AI in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={returnTo ? `/sign-in?returnTo=${encodeURIComponent(returnTo)}` : "/sign-in"}
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton returnTo={returnTo} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wide">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <SignUpForm returnTo={returnTo} />
      </div>
    </AuthCard>
  );
}

import Link from "next/link";
import { AuthCard } from "../auth-card";
import { GoogleButton } from "../google-button";
import { SignInForm } from "./sign-in-form";

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { returnTo?: string; reset?: string };
}) {
  const returnTo = searchParams?.returnTo;
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your workspace."
      footer={
        <>
          New here?{" "}
          <Link
            href={returnTo ? `/sign-up?returnTo=${encodeURIComponent(returnTo)}` : "/sign-up"}
            className="font-medium text-foreground hover:underline"
          >
            Create an account
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

        <SignInForm returnTo={returnTo} resetNotice={searchParams?.reset === "1"} />
      </div>
    </AuthCard>
  );
}

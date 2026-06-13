import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      {/* fallback (not force) so an invite ?redirect_url wins; else onboarding. */}
      <SignUp fallbackRedirectUrl="/onboarding" signInUrl="/sign-in" />
    </div>
  );
}

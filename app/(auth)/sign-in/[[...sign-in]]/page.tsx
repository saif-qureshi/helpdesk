import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      {/* Honors any ?redirect_url (e.g. from a protected route); else the inbox. */}
      <SignIn fallbackRedirectUrl="/tickets" signUpUrl="/sign-up" />
    </div>
  );
}

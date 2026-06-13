import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { PasswordForm, ProfileForm } from "./account-forms";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?returnTo=/account");

  return (
    <div className="mx-auto max-w-[760px] p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and password.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Profile</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          This is how teammates see you.
        </p>
        <ProfileForm initialName={user.name ?? ""} email={user.email} />
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Password</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Choose a strong password — at least 8 characters.
        </p>
        <PasswordForm hasPassword={user.passwordHash !== null} />
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Sign out</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          End your session on this device.
        </p>
        <form action="/api/auth/sign-out" method="POST">
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground shadow-xs hover:bg-muted"
          >
            Sign out
          </button>
        </form>
      </Card>
    </div>
  );
}

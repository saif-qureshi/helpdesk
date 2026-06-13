import { UserProfile } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import { Card } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[960px] p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-foreground">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, security, and connected accounts.
        </p>
      </div>
      {isClerkConfigured ? (
        <UserProfile routing="hash" />
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          Sign in to manage your account.
        </Card>
      )}
    </div>
  );
}

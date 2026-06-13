"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordAction,
  updateProfileAction,
  type AccountResult,
} from "./actions";

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res: AccountResult = await updateProfileAction(formData);
      if (res.ok) toast.success("Profile updated.");
      else toast.error(res.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initialName} required />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [pending, startTransition] = useTransition();

  if (!hasPassword) {
    return (
      <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        This account signs in via Google. Add a password by signing out and
        using <span className="font-medium">Forgot password</span> on the
        sign-in page.
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await changePasswordAction(formData);
      if (res.ok) {
        toast.success("Password updated.");
        form.reset();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-[11px] text-muted-foreground">At least 8 characters.</p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}

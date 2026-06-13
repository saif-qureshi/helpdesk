"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, type FormState } from "../actions";
import { SubmitButton } from "../submit-button";

const INITIAL: FormState = { error: null };

export function SignInForm({
  returnTo,
  resetNotice,
}: {
  returnTo?: string;
  resetNotice?: boolean;
}) {
  const [state, formAction] = useFormState(signInAction, INITIAL);
  return (
    <form action={formAction} className="space-y-4">
      {returnTo ? (
        <input type="hidden" name="returnTo" value={returnTo} />
      ) : null}

      {resetNotice ? (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
          Password updated. Sign in to continue.
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Forgot?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error ? (
        <p className="text-xs text-danger">{state.error}</p>
      ) : null}

      <SubmitButton label="Sign in" pendingLabel="Signing in..." />
    </form>
  );
}

"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction, type FormState } from "../actions";
import { SubmitButton } from "../submit-button";

const INITIAL: FormState = { error: null };

export function SignUpForm({ returnTo }: { returnTo?: string }) {
  const [state, formAction] = useFormState(signUpAction, INITIAL);
  return (
    <form action={formAction} className="space-y-4">
      {returnTo ? (
        <input type="hidden" name="returnTo" value={returnTo} />
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-[11px] text-muted-foreground">At least 8 characters.</p>
      </div>

      {state.error ? (
        <p className="text-xs text-danger">{state.error}</p>
      ) : null}

      <SubmitButton label="Create account" pendingLabel="Creating..." />
    </form>
  );
}

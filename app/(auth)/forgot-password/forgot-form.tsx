"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction, type FormState } from "../actions";
import { SubmitButton } from "../submit-button";

const INITIAL: FormState = { error: null };

export function ForgotForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, INITIAL);

  if (state.ok) {
    return (
      <div className="rounded-md border border-success/30 bg-success/10 px-3 py-3 text-sm text-success">
        If an account exists for that email, we&rsquo;ve sent a reset link.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error ? (
        <p className="text-xs text-danger">{state.error}</p>
      ) : null}
      <SubmitButton label="Send reset link" pendingLabel="Sending..." />
    </form>
  );
}

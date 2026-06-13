"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type FormState } from "../../actions";
import { SubmitButton } from "../../submit-button";

const INITIAL: FormState = { error: null };

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, INITIAL);
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
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
      <SubmitButton label="Set new password" pendingLabel="Saving..." />
    </form>
  );
}

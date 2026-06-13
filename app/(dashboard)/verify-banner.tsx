"use client";

import { useState, useTransition } from "react";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import { resendVerificationAction } from "./actions";

export function VerifyEmailBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (dismissed) return null;

  const resend = () =>
    startTransition(async () => {
      const res = await resendVerificationAction();
      if (res.ok) {
        toast.success("Verification email sent. Check your inbox.");
      } else {
        toast.error(res.error);
      }
    });

  return (
    <div className="flex items-center gap-3 border-b border-warning/30 bg-warning-muted px-4 py-2 text-xs text-warning-foreground">
      <Mail size={14} className="text-warning" />
      <span className="flex-1">
        Please verify <span className="font-medium">{email}</span> — we&rsquo;ve
        sent a confirmation link.
      </span>
      <button
        type="button"
        onClick={resend}
        disabled={pending}
        className="rounded-md border border-warning/30 bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted disabled:opacity-50"
      >
        {pending ? "Sending..." : "Resend"}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

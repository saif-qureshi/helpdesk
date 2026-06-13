import Link from "next/link";
import { GoogleIcon } from "@/components/icons/brand-icons";

export function GoogleButton({ returnTo }: { returnTo?: string }) {
  const href = returnTo
    ? `/api/auth/google/login?returnTo=${encodeURIComponent(returnTo)}`
    : "/api/auth/google/login";
  return (
    <Link
      href={href}
      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-background text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted"
    >
      <GoogleIcon className="h-4 w-4" />
      Continue with Google
    </Link>
  );
}

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-6 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles size={16} />
          </span>
          {BRAND_NAME}
        </Link>

        <div className="rounded-xl border border-border bg-card p-7 shadow-card">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}

          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-5 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium",
  {
    variants: {
      tone: {
        gray: "bg-muted text-muted-foreground",
        primary: "bg-primary-muted text-primary-muted-foreground",
        ai: "bg-ai-muted text-ai-muted-foreground",
        success: "bg-success-muted text-success-muted-foreground",
        warning: "bg-warning-muted text-warning-muted-foreground",
        danger: "bg-danger-muted text-danger-muted-foreground",
        neutral: "bg-background text-foreground border border-border",
      },
    },
    defaultVariants: { tone: "gray" },
  },
);

type Tone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

const dotColor: Record<Tone, string> = {
  gray: "bg-muted-foreground",
  primary: "bg-primary",
  ai: "bg-ai",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-muted-foreground",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  icon?: LucideIcon;
}

function Badge({ className, tone, dot, icon: Icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[tone ?? "gray"])} />}
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };

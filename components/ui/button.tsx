import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,box-shadow,transform,border-color] duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // shadcn defaults
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 border border-primary",
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-xs hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
        // brand variants
        primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 border border-primary",
        secondary: "bg-background text-foreground border border-border shadow-xs hover:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        ai: "bg-ai text-ai-foreground border border-ai shadow-xs hover:bg-ai/90",
        aiGhost: "bg-ai-muted text-ai-muted-foreground border border-ai-border hover:bg-ai-muted/60",
        danger: "bg-danger text-danger-foreground border border-danger shadow-xs hover:bg-danger/90",
        dangerGhost: "bg-background text-danger border border-danger-border hover:bg-danger-muted",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Convenience: renders a leading lucide icon (sized to the button). */
  icon?: LucideIcon;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon: Icon, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props}>
          {children}
        </Slot>
      );
    }
    const iconSize = size === "sm" ? 14 : 16;
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {Icon && <Icon size={iconSize} />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

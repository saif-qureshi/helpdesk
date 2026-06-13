"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CreditCard,
  Inbox,
  Lock,
  type LucideIcon,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  ai?: boolean;
}

const GROUPS: { group: string; items: Item[] }[] = [
  {
    group: "Workspace",
    items: [
      { href: "/settings/general", label: "General", icon: Building2 },
      { href: "/settings/team", label: "Team & roles", icon: Users },
      { href: "/settings/channels", label: "Channels", icon: Inbox },
    ],
  },
  {
    group: "AI",
    items: [
      { href: "/settings/triage-rules", label: "Triage rules", icon: Sparkles, ai: true },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/settings/billing", label: "Billing & plan", icon: CreditCard },
      { href: "/settings/security", label: "Security", icon: Lock },
    ],
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      <div className="hidden w-[220px] flex-shrink-0 overflow-y-auto border-r border-border bg-card md:block">
        <div className="flex h-14 items-center border-b border-border px-5">
          <h1 className="text-[15px] font-semibold text-foreground">Settings</h1>
        </div>
        <nav className="space-y-3 p-2">
          {GROUPS.map((g) => (
            <div key={g.group}>
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {g.group}
              </div>
              {g.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-primary-muted text-primary-muted-foreground"
                        : "text-foreground/80 hover:bg-muted/60",
                    )}
                  >
                    <item.icon
                      size={15}
                      className={cn(item.ai && !active && "text-ai")}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto bg-muted/30">{children}</div>
    </div>
  );
}

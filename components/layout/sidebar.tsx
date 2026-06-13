"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Inbox,
  type LucideIcon,
  MessageCircle,
  Settings,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENT_AGENT, TICKETS } from "@/lib/dummy-data";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  ai?: boolean;
}

const inboxCount = TICKETS.filter(
  (t) => t.assigneeId === CURRENT_AGENT.id && t.status !== "resolved",
).length;

const WORK: NavLink[] = [
  { href: "/tickets", label: "Inbox", icon: Inbox, badge: inboxCount },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/widget", label: "Chat widget", icon: MessageCircle },
  { href: "/playbooks", label: "Bot playbooks", icon: Wand2, ai: true },
  { href: "/help-center", label: "Help center", icon: BookOpen },
];

const CONFIGURE: NavLink[] = [
  { href: "/settings/general", label: "Settings", icon: Settings },
];

export function Sidebar({
  workspaceName,
  workspaceLogoUrl,
}: {
  workspaceName: string;
  workspaceLogoUrl?: string | null;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden w-[220px] flex-shrink-0 flex-col border-r border-border bg-card md:flex">
      <WorkspaceSwitcher name={workspaceName} logoUrl={workspaceLogoUrl} />

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        <SectionLabel>Work</SectionLabel>
        {WORK.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
        <SectionLabel className="pt-4">Configure</SectionLabel>
        {CONFIGURE.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname.startsWith("/settings")}
          />
        ))}
      </nav>
    </aside>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  ai,
  active,
}: NavLink & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors",
        active
          ? "bg-primary-muted text-primary-muted-foreground"
          : "text-foreground/80 hover:bg-muted/60",
      )}
    >
      <Icon
        size={15}
        className={cn(ai && !active && "text-ai")}
      />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-semibold",
            active
              ? "bg-primary-muted-foreground/15 text-primary-muted-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

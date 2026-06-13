"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  LayoutTemplate,
  type LucideIcon,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CONVERSATIONS } from "@/lib/conversation-data";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const waitingCount = CONVERSATIONS.filter(
  (c) => c.state === "WAITING_AGENT",
).length;

const NAV: NavLink[] = [
  { href: "/conversations", label: "Conversations", icon: MessageSquare, badge: waitingCount },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/knowledge", label: "Knowledge base", icon: BookOpen },
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
    <aside className="hidden w-[240px] flex-shrink-0 flex-col border-r border-slate-200 bg-slate-50 md:flex">
      <WorkspaceSwitcher name={workspaceName} logoUrl={workspaceLogoUrl} />

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="border-t border-slate-200 px-2 py-3">
        <NavItem
          href="/settings/channels"
          label="Settings"
          icon={Settings}
          active={pathname.startsWith("/settings")}
        />
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: NavLink & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors",
        active
          ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon
        size={16}
        className={cn(active ? "text-indigo-600" : "text-slate-500")}
      />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 ? (
        <span
          className={cn(
            "inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
            "bg-red-500 text-white",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

"use client";

import { Bell, Search } from "lucide-react";
import { UserMenu, type UserMenuUser } from "@/components/layout/user-menu";

export function Topbar({ user }: { user: UserMenuUser }) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <label className="relative w-full max-w-sm">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          placeholder="Search tickets, customers…"
          className="h-9 w-full rounded-md border border-border bg-muted/40 pl-9 pr-14 text-sm placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </label>

      <div className="flex-1" />

      <button
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell size={17} />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
      </button>

      <div className="h-6 w-px bg-border" />

      <UserMenu user={user} />
    </header>
  );
}

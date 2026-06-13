"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface UserMenuUser {
  name: string | null;
  email: string;
  image: string | null;
}

export function UserMenu({ user }: { user: UserMenuUser }) {
  const displayName = user.name?.trim() || user.email.split("@")[0] || "Account";
  const initials = computeInitials(user.name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 hover:bg-muted">
          <Avatar imageUrl={user.image} initials={initials} />
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block max-w-[140px] truncate text-xs font-medium text-foreground">
              {displayName}
            </span>
            <span className="block max-w-[140px] truncate text-[10px] text-muted-foreground">
              {user.email}
            </span>
          </span>
          <ChevronsUpDown size={13} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-sm">{displayName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserCog size={15} /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="text-danger focus:bg-danger-muted focus:text-danger"
        >
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-left"
            >
              <LogOut size={15} /> Log out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Avatar({
  imageUrl,
  initials,
}: {
  imageUrl: string | null;
  initials: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground",
      )}
    >
      {initials}
    </span>
  );
}

function computeInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    const joined = `${a}${b}`.toUpperCase();
    if (joined) return joined;
  }
  return (email[0] ?? "?").toUpperCase();
}

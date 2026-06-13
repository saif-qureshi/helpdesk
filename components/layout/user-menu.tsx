"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { ChevronsUpDown, LogOut, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { isClerkConfigured } from "@/lib/auth/clerk-config";
import { CURRENT_AGENT } from "@/lib/dummy-data";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  return isClerkConfigured ? <ClerkUserMenu /> : <MockUserMenu />;
}

function Shell({
  avatar,
  name,
  detail,
  children,
}: {
  avatar: React.ReactNode;
  name: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 hover:bg-muted">
          {avatar}
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block max-w-[140px] truncate text-xs font-medium text-foreground">
              {name}
            </span>
            <span className="block max-w-[140px] truncate text-[10px] text-muted-foreground">
              {detail}
            </span>
          </span>
          <ChevronsUpDown size={13} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-sm">{name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {detail}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ClerkUserMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />;
  }

  const name = user?.fullName ?? user?.username ?? "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    (email[0] ?? "?").toUpperCase();

  return (
    <Shell
      name={name}
      detail={email}
      avatar={<ClerkAvatar imageUrl={user?.imageUrl} initials={initials} />}
    >
      <DropdownMenuItem asChild>
        <Link href="/account">
          <UserCog size={15} /> Account
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/sign-in" })}>
        <LogOut size={15} /> Log out
      </DropdownMenuItem>
    </Shell>
  );
}

function ClerkAvatar({
  imageUrl,
  initials,
}: {
  imageUrl?: string;
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

function MockUserMenu() {
  return (
    <Shell
      name={CURRENT_AGENT.name}
      detail={CURRENT_AGENT.role}
      avatar={<AgentAvatar person={CURRENT_AGENT} size={28} />}
    >
      <DropdownMenuItem asChild>
        <Link href="/account">
          <UserCog size={15} /> Account
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/sign-in">
          <LogOut size={15} /> Log out
        </Link>
      </DropdownMenuItem>
    </Shell>
  );
}

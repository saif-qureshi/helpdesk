"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Mail, MoreHorizontal, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/generated/prisma/enums";
import type { InvitationRecord, MemberRecord } from "@/lib/core/repositories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabBar } from "@/components/ui/tab-bar";
import { SimpleSelect } from "@/components/shared/simple-select";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsHeader } from "@/components/settings/page-header";
import {
  changeMemberRoleAction,
  inviteMemberAction,
  removeMemberAction,
  resendInvitationAction,
  revokeInvitationAction,
} from "./actions";

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  AGENT: "Agent",
  VIEWER: "Viewer",
};

export function TeamView({
  members,
  invitations,
  currentUserId,
  canManage,
}: {
  members: MemberRecord[];
  invitations: InvitationRecord[];
  currentUserId: string | null;
  canManage: boolean;
}) {
  const [tab, setTab] = useState("members");
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    startTransition(async () => {
      const res = await action();
      if (res.ok) toast.success(ok);
      else toast.error(res.error ?? "Something went wrong.");
    });

  const resend = (id: string) =>
    startTransition(async () => {
      const res = await resendInvitationAction(id);
      if (res.ok) {
        await navigator.clipboard?.writeText(res.url).catch(() => undefined);
        toast.success("Invite link copied to clipboard");
      } else {
        toast.error(res.error);
      }
    });

  const admins = members.filter(
    (m) => m.role === Role.OWNER || m.role === Role.ADMIN,
  ).length;

  return (
    <div className="min-h-full">
      <SettingsHeader
        title="Team & roles"
        sub="Manage who can access this workspace and what they can do."
        action={canManage ? <InviteDialog disabled={pending} onInvite={run} /> : undefined}
      />
      <div className="mx-auto max-w-[1080px] space-y-6 px-8 py-6 pb-16">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Members" value={String(members.length)} sub="in this workspace" />
          <StatTile label="Admins" value={String(admins)} sub="owners + admins" />
          <StatTile
            label="Pending invites"
            value={String(invitations.length)}
            sub="awaiting acceptance"
            accent="warning"
          />
          <StatTile
            label="Agents"
            value={String(members.filter((m) => m.role === Role.AGENT).length)}
            sub="reply to tickets"
          />
        </div>

        <Card className="overflow-hidden p-0">
          <div className="px-5 pt-4">
            <TabBar
              className="border-b-0"
              active={tab}
              onChange={setTab}
              items={[
                { id: "members", label: "Members", count: members.length },
                { id: "pending", label: "Pending", count: invitations.length },
                { id: "roles", label: "Roles & permissions" },
              ]}
            />
          </div>

          {tab === "members" && (
            <table className="mt-1 w-full text-[13px]">
              <thead>
                <tr className="border-y border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 text-left">Member</th>
                  <th className="px-5 py-2.5 text-left">Role</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const display = m.name?.trim() || m.email;
                  const isSelf = m.clerkUserId === currentUserId;
                  const isOwner = m.role === Role.OWNER;
                  return (
                    <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <AgentAvatar person={{ name: display, initials: "", color: "#6366F1" }} size={28} />
                          <div>
                            <div className="text-[13px] font-medium text-foreground">
                              {display} {isSelf && <span className="text-muted-foreground">(you)</span>}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {canManage && !isOwner ? (
                          <RoleMenu
                            value={m.role}
                            disabled={pending}
                            onChange={(role) =>
                              run(() => changeMemberRoleAction(m.id, role), "Role updated")
                            }
                          />
                        ) : (
                          <Badge tone={isOwner ? "primary" : "gray"}>{ROLE_LABEL[m.role]}</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {canManage && !isOwner && !isSelf && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground">
                                <MoreHorizontal size={14} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  run(() => removeMemberAction(m.id), "Member removed")
                                }
                                className="text-danger"
                              >
                                Remove from workspace
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {tab === "pending" && (
            <div className="border-t border-border">
              {invitations.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No pending invitations.
                </p>
              ) : (
                invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-3 border-b border-border/60 px-5 py-3 last:border-0"
                  >
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-warning-border bg-warning-muted text-warning-muted-foreground">
                      <Mail size={12} />
                    </div>
                    <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                      {inv.email}
                    </span>
                    <Badge tone="primary">{ROLE_LABEL[inv.role]}</Badge>
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() => resend(inv.id)}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            run(() => revokeInvitationAction(inv.id), "Invitation revoked")
                          }
                        >
                          Revoke
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "roles" && (
            <div className="border-t border-border p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <RoleCard
                  role="Owner"
                  count={members.filter((m) => m.role === Role.OWNER).length}
                  desc="Full access. Can delete the workspace and transfer ownership."
                  perms={[["Tickets", true], ["Settings", true], ["Billing", true], ["Delete workspace", true]]}
                />
                <RoleCard
                  role="Admin"
                  count={members.filter((m) => m.role === Role.ADMIN).length}
                  accent
                  desc="Manage tickets, team, settings, and billing."
                  perms={[["Tickets", true], ["Settings", true], ["Billing", true], ["Delete workspace", false]]}
                />
                <RoleCard
                  role="Agent"
                  count={members.filter((m) => m.role === Role.AGENT).length}
                  desc="Reply to tickets and view own queue."
                  perms={[["Tickets", true], ["Settings", false], ["Billing", false], ["Delete workspace", false]]}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function RoleMenu({
  value,
  disabled,
  onChange,
}: {
  value: Role;
  disabled: boolean;
  onChange: (role: Role) => void;
}) {
  const options: Role[] = [Role.ADMIN, Role.AGENT, Role.VIEWER];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" disabled={disabled}>
          {ROLE_LABEL[value]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((r) => (
          <DropdownMenuItem key={r} onClick={() => onChange(r)}>
            {value === r && <Check size={14} />}
            {ROLE_LABEL[r]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InviteDialog({
  disabled,
  onInvite,
}: {
  disabled: boolean;
  onInvite: (
    action: () => Promise<{ ok: boolean; error?: string }>,
    ok: string,
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Admin" | "Agent">("Agent");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" icon={UserPlus}>
          Invite teammate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            They&rsquo;ll get an email invitation to join this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-foreground">
              Role
            </label>
            <SimpleSelect
              value={role}
              onValueChange={(v) => setRole(v as "Admin" | "Agent")}
              options={["Agent", "Admin"]}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={disabled || !email}
            onClick={() =>
              onInvite(() => {
                setOpen(false);
                const value = email;
                setEmail("");
                return inviteMemberAction(value, role === "Admin" ? "ADMIN" : "AGENT");
              }, "Invitation sent")
            }
          >
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "warning";
}) {
  return (
    <Card className="p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold leading-none tracking-tight",
          accent === "warning" ? "text-warning-muted-foreground" : "text-foreground",
        )}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">{sub}</div>
    </Card>
  );
}

function RoleCard({
  role,
  count,
  desc,
  perms,
  accent,
}: {
  role: string;
  count: number;
  desc: string;
  perms: [string, boolean][];
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent ? "border-primary-border bg-primary-muted/30" : "border-border bg-card",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{role}</h4>
        <Badge tone={accent ? "primary" : "gray"}>
          {count} {count === 1 ? "member" : "members"}
        </Badge>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      <ul className="space-y-1.5 text-xs">
        {perms.map(([k, v]) => (
          <li key={k} className="flex items-center gap-2">
            {v ? (
              <Check size={12} className="text-success" />
            ) : (
              <X size={12} className="text-muted-foreground/40" />
            )}
            <span className={v ? "text-foreground/80" : "text-muted-foreground/60"}>{k}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

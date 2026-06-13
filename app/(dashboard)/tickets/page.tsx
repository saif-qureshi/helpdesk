"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Sparkles } from "lucide-react";
import type { Ticket } from "@/types";
import { CURRENT_AGENT, TICKETS } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { TabBar } from "@/components/ui/tab-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterDropdown } from "@/components/tickets/filter-dropdown";
import { TicketRow } from "@/components/tickets/ticket-row";
import { TicketPreview } from "@/components/tickets/ticket-preview";

type Tab = "my" | "all" | "unassigned";

export default function TicketsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("my");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [team, setTeam] = useState("all");
  const [selectedId, setSelectedId] = useState<number>(1042);

  const filtered = useMemo(() => {
    let list: Ticket[] = TICKETS;
    if (tab === "my") list = list.filter((t) => t.assigneeId === CURRENT_AGENT.id);
    if (tab === "unassigned") list = list.filter((t) => !t.assigneeId);
    if (status !== "all") list = list.filter((t) => t.status === status);
    if (priority !== "all") list = list.filter((t) => t.priority === priority);
    if (team !== "all") list = list.filter((t) => t.team === team);
    return list;
  }, [tab, status, priority, team]);

  useEffect(() => {
    if (filtered.length && !filtered.some((t) => t.id === selectedId)) {
      setSelectedId(filtered[0]!.id);
    }
  }, [filtered, selectedId]);

  const selected =
    TICKETS.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const counts = {
    my: TICKETS.filter((t) => t.assigneeId === CURRENT_AGENT.id).length,
    all: TICKETS.length,
    unassigned: TICKETS.filter((t) => !t.assigneeId).length,
  };

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="flex min-w-0 flex-1 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center gap-3 border-b border-border px-5">
          <h1 className="text-[15px] font-semibold text-foreground">Inbox</h1>
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {TICKETS.length} tickets
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 px-5">
          <TabBar
            className="border-b-0"
            active={tab}
            onChange={(id) => setTab(id as Tab)}
            items={[
              { id: "my", label: "My queue", count: counts.my },
              { id: "all", label: "All tickets", count: counts.all },
              { id: "unassigned", label: "Unassigned", count: counts.unassigned },
            ]}
          />
          <div className="flex items-center gap-2 py-2">
            <FilterDropdown
              label="Status"
              value={status}
              options={["all", "open", "pending", "resolved"]}
              onChange={setStatus}
            />
            <FilterDropdown
              label="Priority"
              value={priority}
              options={["all", "urgent", "high", "normal", "low"]}
              onChange={setPriority}
            />
            <FilterDropdown
              label="Team"
              value={team}
              options={["all", "Engineering", "Billing", "Product", "Support"]}
              onChange={setTeam}
            />
          </div>
        </div>

        <div className="flex h-9 items-center justify-between border-y border-border bg-muted/40 px-5 text-xs text-muted-foreground">
          <span>
            Sorted by:{" "}
            <span className="font-medium text-foreground">Last updated ↓</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Sparkles size={12} className="text-ai" /> AI auto-categorising 3 new
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Inbox zero"
              description="No tickets match your filters. Try clearing them, or grab one from the unassigned queue."
              action={
                <Button variant="secondary" onClick={() => setTab("unassigned")}>
                  View unassigned
                </Button>
              }
            />
          ) : (
            filtered.map((t) => (
              <TicketRow
                key={t.id}
                ticket={t}
                selected={t.id === selectedId}
                onSelect={() => setSelectedId(t.id)}
                onOpen={() => router.push(`/tickets/${t.id}`)}
              />
            ))
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="hidden w-[460px] flex-shrink-0 overflow-y-auto bg-muted/30 xl:block">
        {selected && <TicketPreview ticket={selected} />}
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import type { Ticket } from "@/types";
import { agentById, customerById } from "@/lib/dummy-data";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import { CategoryBadge } from "@/components/shared/category-badge";
import { PriorityDot } from "@/components/shared/priority-dot";
import { SlaIndicator } from "@/components/shared/sla-indicator";
import { StatusBadge } from "@/components/shared/status-badge";

export function TicketRow({
  ticket,
  selected,
  onSelect,
  onOpen,
}: {
  ticket: Ticket;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  const customer = customerById(ticket.customerId);
  const assignee = agentById(ticket.assigneeId);

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onOpen}
      className={cn(
        "relative flex cursor-pointer items-center gap-3 border-b border-border/60 py-3 pl-5 pr-4",
        selected ? "bg-primary-muted/70" : "hover:bg-muted/50",
      )}
    >
      {selected && (
        <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-primary" />
      )}
      <PriorityDot priority={ticket.priority} />
      <span className="w-12 flex-shrink-0 font-mono text-xs text-muted-foreground">
        #{ticket.id}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-foreground">
              {customer?.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              · {customer?.company}
            </span>
          </div>
          <div className="truncate text-[13px] text-foreground/80">
            {ticket.subject}
          </div>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <CategoryBadge category={ticket.category} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        {assignee ? (
          <AgentAvatar person={assignee} size={22} />
        ) : (
          <span className="text-[11px] italic text-muted-foreground">
            Unassigned
          </span>
        )}
        <span className="w-14 text-right text-xs text-muted-foreground">
          {ticket.updatedLabel}
        </span>
        <SlaIndicator sla={ticket.sla} />
      </div>
    </div>
  );
}

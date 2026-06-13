"use client";

import Link from "next/link";
import { Check, ChevronDown, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CURRENT_AGENT,
  TICKETS,
  agentById,
  customerById,
  getConversation,
  ticketById,
} from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import { CategoryBadge } from "@/components/shared/category-badge";
import { PriorityDot } from "@/components/shared/priority-dot";
import { SlaIndicator } from "@/components/shared/sla-indicator";
import { StatusBadge } from "@/components/shared/status-badge";
import { AiInsightsPanel } from "@/components/tickets/ai-insights-panel";
import { ConversationThread } from "@/components/tickets/conversation-thread";
import { ReplyComposer } from "@/components/tickets/reply-composer";

export function TicketDetail({ ticketId }: { ticketId: number }) {
  const ticket = ticketById(ticketId);
  if (!ticket) return null;

  const customer = customerById(ticket.customerId);
  const assignee = agentById(ticket.assigneeId);
  const myTickets = TICKETS.filter((t) => t.assigneeId === CURRENT_AGENT.id);

  return (
    <div className="flex h-full">
      {/* Mini queue */}
      <div className="hidden w-[240px] flex-shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80 hover:text-foreground"
          >
            <ChevronLeft size={14} /> Back to inbox
          </Link>
        </div>
        <div className="border-b border-border px-4 py-3">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Your queue
          </div>
          <div className="text-xs text-muted-foreground">
            {myTickets.length} open
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {myTickets.map((t) => {
            const c = customerById(t.customerId);
            const active = t.id === ticket.id;
            return (
              <Link
                key={t.id}
                href={`/tickets/${t.id}`}
                className={cn(
                  "relative block border-b border-border/60 px-4 py-2.5",
                  active ? "bg-primary-muted/70" : "hover:bg-muted/50",
                )}
              >
                {active && (
                  <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-primary" />
                )}
                <div className="mb-0.5 flex items-center gap-2">
                  <PriorityDot priority={t.priority} />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    #{t.id}
                  </span>
                  <SlaIndicator sla={t.sla} size={12} />
                </div>
                <div className="truncate text-[12px] font-medium text-foreground">
                  {c?.name}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {t.subject}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex min-w-0 flex-1 flex-col bg-card">
        <div className="border-b border-border px-6 py-4">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">#{ticket.id}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 capitalize">
              <PriorityDot priority={ticket.priority} />
              {ticket.priority} priority
            </span>
            <span>·</span>
            <CategoryBadge category={ticket.category} />
          </div>
          <h1 className="text-xl font-semibold leading-tight text-foreground">
            {ticket.subject}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
            <StatusBadge status={ticket.status} />
            <span className="text-xs text-muted-foreground">Assigned to</span>
            <button className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-foreground hover:bg-muted">
              <AgentAvatar person={assignee} size={18} />
              {assignee?.name ?? "Unassigned"}
              <ChevronDown size={11} />
            </button>
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <SlaIndicator sla={ticket.sla} /> SLA {ticket.sla}
            </span>
            <Button variant="secondary" size="sm" icon={Check}>
              Resolve
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ConversationThread
            messages={getConversation(ticket.id)}
            customer={customer}
          />
        </div>

        <ReplyComposer customerName={customer?.name ?? "the customer"} />
      </div>

      {/* Insights */}
      <div className="hidden xl:block">
        <AiInsightsPanel ticket={ticket} />
      </div>
    </div>
  );
}

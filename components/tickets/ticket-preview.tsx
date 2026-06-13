"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, RefreshCw, Sparkles, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan, Ticket } from "@/types";
import { agentById, customerById, getConversation } from "@/lib/dummy-data";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import { AiBadge } from "@/components/shared/ai-badge";
import { PriorityDot } from "@/components/shared/priority-dot";
import { SlaIndicator } from "@/components/shared/sla-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const planTone: Record<Plan, "primary" | "success" | "gray"> = {
  enterprise: "primary",
  growth: "success",
  starter: "gray",
};

const slaView = {
  breached: { label: "SLA breached", time: "47m overdue", width: "100%", bar: "bg-danger" },
  risk: { label: "SLA at risk", time: "1h 12m left", width: "78%", bar: "bg-warning" },
  healthy: { label: "SLA healthy", time: "6h 38m left", width: "32%", bar: "bg-success" },
} as const;

export function TicketPreview({ ticket }: { ticket: Ticket }) {
  const customer = customerById(ticket.customerId);
  const latest = getConversation(ticket.id)
    .filter((m) => m.type === "customer" || m.type === "agent" || m.type === "ai")
    .slice(-2);
  const sla = slaView[ticket.sla];

  return (
    <div className="space-y-4 p-5">
      {/* Customer */}
      <div className="flex items-start gap-3">
        <AgentAvatar
          person={{ name: customer?.name ?? "?", initials: "", color: "#6366F1" }}
          size={44}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-foreground">
            {customer?.name}
          </h3>
          <div className="truncate text-xs text-muted-foreground">
            {customer?.company} · {customer?.email}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Customer since {customer?.joinedAt} · {customer?.totalTickets} tickets
          </div>
        </div>
        {customer && (
          <Badge tone={planTone[customer.plan]} className="capitalize">
            {customer.plan}
          </Badge>
        )}
      </div>

      {/* Subject */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            #{ticket.id}
          </span>
          <PriorityDot priority={ticket.priority} />
          <span className="text-[11px] capitalize text-muted-foreground">
            {ticket.priority} priority
          </span>
        </div>
        <h2 className="text-lg font-semibold leading-snug text-foreground">
          {ticket.subject}
        </h2>
      </div>

      {/* AI summary */}
      <Card className="border-ai-border bg-ai-muted/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <AiBadge label="AI summary" />
          <button className="inline-flex items-center gap-1 text-[11px] text-ai-muted-foreground hover:opacity-80">
            <RefreshCw size={11} /> Regenerate
          </button>
        </div>
        <p className="text-[13px] leading-relaxed text-foreground/80">
          {ticket.aiSummary ??
            `Customer reports an issue with ${ticket.subject.toLowerCase()}. Sentiment is neutral; similar to past tickets resolved by linking the relevant KB article.`}
        </p>
        <div className="mt-3 flex items-center gap-2 border-t border-ai-border/60 pt-3">
          <Badge tone="ai" icon={Sparkles}>
            {ticket.category}
          </Badge>
          {ticket.aiSentiment && (
            <Badge tone="ai" className="capitalize">
              Sentiment: {ticket.aiSentiment}
              {ticket.aiSentimentConfidence
                ? ` · ${ticket.aiSentimentConfidence}%`
                : ""}
            </Badge>
          )}
        </div>
      </Card>

      {/* Latest messages */}
      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Latest messages
        </div>
        <div className="space-y-2">
          {latest.map((m) => {
            const person =
              m.type === "customer" ? customer : agentById(m.authorId);
            const who =
              m.type === "ai" ? "AI assistant" : (person?.name ?? "Unknown");
            return (
              <div
                key={m.id}
                className={cn(
                  "rounded-md border p-3",
                  m.type === "customer"
                    ? "border-border bg-muted/40"
                    : "border-primary-border/60 bg-primary-muted/40",
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[12px] font-medium text-foreground">
                    {who}
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {m.time}
                  </span>
                </div>
                <p className="line-clamp-2 text-[12px] leading-relaxed text-foreground/75">
                  {m.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SLA */}
      <Card
        className={cn(
          "p-4",
          ticket.sla === "breached" && "border-danger-border bg-danger-muted/40",
          ticket.sla === "risk" && "border-warning-border bg-warning-muted/40",
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <SlaIndicator sla={ticket.sla} />
            {sla.label}
          </div>
          <span className="text-xs text-muted-foreground">{sla.time}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", sla.bar)}
            style={{ width: sla.width }}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/tickets/${ticket.id}`}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowRight size={16} /> Open full ticket
        </Link>
        <Button variant="aiGhost" icon={Sparkles}>
          Reply with AI draft
        </Button>
        <Button variant="secondary" icon={UserPlus}>
          Assign to me
        </Button>
        <Button variant="secondary" icon={ChevronDown}>
          Change status
        </Button>
      </div>
    </div>
  );
}

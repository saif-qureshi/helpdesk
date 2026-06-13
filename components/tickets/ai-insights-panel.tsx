import { ArrowRight, BookOpen, Mail, Plus, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan, Sentiment, Ticket } from "@/types";
import { AGENTS, customerById } from "@/lib/dummy-data";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import { Badge } from "@/components/ui/badge";

const planTone: Record<Plan, "primary" | "success" | "gray"> = {
  enterprise: "primary",
  growth: "success",
  starter: "gray",
};

const sentimentEmoji: Record<Sentiment, string> = {
  frustrated: "😤",
  neutral: "😐",
  satisfied: "🙂",
};

export function AiInsightsPanel({ ticket }: { ticket: Ticket }) {
  const customer = customerById(ticket.customerId);
  const sentiment = ticket.aiSentiment ?? "neutral";
  const confidence = ticket.aiSentimentConfidence ?? 70;
  const watchers = [AGENTS[0], AGENTS[2], AGENTS[5]].filter(Boolean);

  return (
    <div className="w-[320px] flex-shrink-0 overflow-y-auto border-l border-border bg-muted/30">
      <Section title="Customer">
        <div className="flex items-start gap-3">
          <AgentAvatar person={customer} size={36} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-foreground">
              {customer?.name}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {customer?.email}
            </div>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
          <Row label="Company" value={customer?.company} />
          <Row
            label="Plan"
            value={
              customer && (
                <Badge tone={planTone[customer.plan]} className="capitalize">
                  {customer.plan}
                </Badge>
              )
            }
          />
          <Row label="Tickets" value={`${customer?.totalTickets ?? 0} total`} />
          <Row label="Since" value={customer?.joinedAt} />
        </dl>
        <button className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-muted-foreground hover:opacity-80">
          View full profile <ArrowRight size={11} />
        </button>
      </Section>

      <Section title="AI insights" ai>
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-[11px] text-muted-foreground">Sentiment</div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium capitalize text-foreground">
                {sentimentEmoji[sentiment]} {sentiment}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {confidence}% confidence
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-ai"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 text-[11px] text-muted-foreground">
              Predicted category
            </div>
            <div className="text-[13px] text-foreground">{ticket.category}</div>
          </div>
          {ticket.aiSuggestedArticles && ticket.aiSuggestedArticles.length > 0 && (
            <div className="border-t border-ai-border/60 pt-3">
              <div className="mb-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <BookOpen size={11} /> Suggested articles
              </div>
              <ul className="space-y-1">
                {ticket.aiSuggestedArticles.map((a) => (
                  <li key={a.id}>
                    <a className="cursor-pointer text-xs text-ai-muted-foreground hover:underline">
                      {a.title} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      <Section title="Details">
        <dl className="grid grid-cols-2 gap-y-2 text-xs">
          <Row label="Updated" value={ticket.updatedLabel} />
          <Row
            label="Channel"
            value={
              <span className="inline-flex items-center justify-end gap-1 capitalize">
                <Mail size={11} /> {ticket.channel}
              </span>
            }
          />
          <Row label="Team" value={ticket.team} />
          <Row label="Status" value={<span className="capitalize">{ticket.status}</span>} />
        </dl>
        <div className="mt-3 border-t border-border pt-3">
          <div className="mb-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Tag size={11} /> Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ticket.tags.map((t) => (
              <span
                key={t}
                className="inline-flex h-6 items-center rounded-md border border-border bg-background px-2 text-[11px] text-foreground/80"
              >
                {t}
              </span>
            ))}
            <button className="inline-flex h-6 items-center gap-1 rounded-md border border-dashed border-border px-2 text-[11px] text-muted-foreground hover:text-foreground">
              <Plus size={10} /> Add
            </button>
          </div>
        </div>
      </Section>

      <Section title="Watchers">
        <div className="flex items-center gap-1">
          {watchers.map((a) => (
            <AgentAvatar key={a!.id} person={a} size={24} />
          ))}
          <button className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground">
            <Plus size={11} />
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  ai,
  children,
}: {
  title: string;
  ai?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-b border-border p-4",
        ai && "border-l-2 border-l-ai/40 bg-ai-muted/40",
      )}
    >
      <div className="mb-3 flex items-center gap-1.5">
        {ai && <Sparkles size={12} className="text-ai" />}
        <h3
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wide",
            ai ? "text-ai-muted-foreground" : "text-muted-foreground",
          )}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </>
  );
}

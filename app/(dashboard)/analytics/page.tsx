"use client";

import { useState } from "react";
import { BookOpen, Download, Eye, Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ANALYTICS_KPIS,
  SLA_BREACHES,
  TOP_ARTICLES,
  agentById,
} from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import { PriorityDot } from "@/components/shared/priority-dot";
import { KpiCard } from "@/components/analytics/kpi-card";
import { VolumeChart } from "@/components/analytics/volume-chart";
import { CategoryChart } from "@/components/analytics/category-chart";
import { AgentTable } from "@/components/analytics/agent-table";

const RANGES = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");

  return (
    <div>
      <header className="flex items-center justify-between border-b border-border bg-card px-8 py-5">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Reports</div>
          <h1 className="text-[22px] font-semibold text-foreground">Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-md bg-muted p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={cn(
                  "h-7 rounded px-3 text-xs font-medium",
                  range === r.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" icon={Download}>
            Export
          </Button>
        </div>
      </header>

      <div className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ANALYTICS_KPIS.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Ticket volume over time
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Total vs. AI-resolved · last 30 days
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Total
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-ai" /> AI-resolved
                </span>
              </div>
            </div>
            <VolumeChart />
          </Card>

          <Card className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Tickets by category
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Auto-classified by AI
              </p>
            </div>
            <CategoryChart />
          </Card>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Agent performance
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Last 30 days · 8 agents
              </p>
            </div>
          </div>
          <AgentTable />
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <BookOpen size={14} className="text-ai" /> Top knowledge base
                articles
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Used most by AI in replies
              </p>
            </div>
            <ul className="space-y-1">
              {TOP_ARTICLES.map((a, i) => (
                <li
                  key={a.title}
                  className="flex items-center gap-3 rounded px-2 py-2 hover:bg-muted/40"
                >
                  <span className="w-5 font-mono text-xs text-muted-foreground/60">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-[13px] text-foreground/90">
                    {a.title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Eye size={11} /> {a.views.toLocaleString()}
                  </span>
                  <Badge tone="ai" icon={Sparkles}>
                    {a.aiUses}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Flame size={14} className="text-danger" /> Recent SLA breaches
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Action required
                </p>
              </div>
              <button className="text-xs font-medium text-primary-muted-foreground hover:opacity-80">
                View all →
              </button>
            </div>
            <ul className="space-y-1">
              {SLA_BREACHES.map((b) => {
                const agent = agentById(b.agentId);
                return (
                  <li
                    key={b.ticketId}
                    className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-muted/40"
                  >
                    <span className="w-12 font-mono text-xs text-muted-foreground">
                      #{b.ticketId}
                    </span>
                    <PriorityDot priority={b.priority} />
                    <span className="flex-1 truncate text-[13px] text-foreground/90">
                      {b.customerLabel}
                    </span>
                    <AgentAvatar person={agent} size={20} />
                    <span className="w-10 text-right text-[11px] font-medium text-danger-muted-foreground">
                      {b.over}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

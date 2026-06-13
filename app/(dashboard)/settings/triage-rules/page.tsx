"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  MoreHorizontal,
  Plus,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AiBadge } from "@/components/shared/ai-badge";
import { SettingsHeader } from "@/components/settings/page-header";

type Priority = "urgent" | "high" | "normal" | "low";
const priorityTone: Record<Priority, "danger" | "warning" | "primary" | "gray"> = {
  urgent: "danger",
  high: "warning",
  normal: "primary",
  low: "gray",
};

const CATEGORIES: {
  id: number;
  name: string;
  keywords: string;
  team: string;
  priority: Priority;
}[] = [
  { id: 1, name: "Billing", keywords: "invoice, refund, charge, plan, seats, payment", team: "Billing", priority: "normal" },
  { id: 2, name: "Bug", keywords: "error, broken, doesn't work, 500, crash, failing", team: "Engineering", priority: "high" },
  { id: 3, name: "Feature request", keywords: "wish, suggest, would like, can you add", team: "Product", priority: "low" },
  { id: 4, name: "General", keywords: "how do I, help, question", team: "Support", priority: "normal" },
];

const TONE_SAMPLES = {
  professional:
    "Hi Sarah, thank you for reaching out. I've reviewed your account and can confirm the SSO certificate was rotated successfully. Please try signing in again — if the issue persists, I'll escalate to our engineering team.",
  friendly:
    "Hey Sarah! Thanks for the heads-up 👋 Just took a look and everything on the SSO side looks rotated and ready. Give it another go and let me know if you hit any snags — I'm right here.",
  concise:
    "Hi Sarah. SSO certificate rotated successfully. Try signing in. If it fails, reply here and I'll escalate.",
} as const;

type Tone = keyof typeof TONE_SAMPLES;

export default function TriageRulesPage() {
  const [autoClass, setAutoClass] = useState(true);
  const [autoResp, setAutoResp] = useState(true);
  const [threshold, setThreshold] = useState(85);
  const [tone, setTone] = useState<Tone>("professional");
  const [escalate, setEscalate] = useState({
    frustrated: true,
    enterprise: true,
    reopened: false,
    stale: true,
  });
  const [staleHours, setStaleHours] = useState(4);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are the AI support assistant for Northwind. Reply as a knowledgeable, calm member of the support team — never claim to be a human. Always check the customer's plan tier before suggesting solutions, and cite the relevant knowledge base article when one exists. Defer to a human agent on billing disputes over $500, account deletion, and any request that involves legal or compliance review.",
  );

  return (
    <div className="min-h-full">
      <SettingsHeader
        title="Triage rules"
        sub="Configure how the AI classifies, routes, and responds to incoming tickets. Changes apply to all new tickets."
      />

      <div className="mx-auto max-w-[760px] space-y-6 px-8 py-6 pb-28">
        {/* Auto-classification */}
        <Card className="overflow-hidden p-0">
          <Section
            title="Auto-classification"
            description="Automatically tag incoming tickets by category and route them to the right team."
            control={<Switch checked={autoClass} onCheckedChange={setAutoClass} />}
          />
          {autoClass && (
            <div className="border-t border-border">
              <div className="grid grid-cols-[1.4fr_2fr_1.2fr_1fr_24px] gap-3 border-b border-border bg-muted/40 px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>Category</span>
                <span>Keywords / triggers</span>
                <span>Default team</span>
                <span>Priority</span>
                <span />
              </div>
              {CATEGORIES.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[1.4fr_2fr_1.2fr_1fr_24px] items-center gap-3 border-b border-border/60 px-5 py-3 hover:bg-muted/30"
                >
                  <Badge tone="ai" icon={Sparkles}>
                    {c.name}
                  </Badge>
                  <div className="truncate text-xs text-muted-foreground" title={c.keywords}>
                    {c.keywords}
                  </div>
                  <div className="text-xs text-foreground">{c.team}</div>
                  <div>
                    <Badge tone={priorityTone[c.priority]} dot className="capitalize">
                      {c.priority}
                    </Badge>
                  </div>
                  <button className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              ))}
              <div className="px-5 py-3">
                <button className="inline-flex items-center gap-1 text-xs font-medium text-primary-muted-foreground hover:opacity-80">
                  <Plus size={12} /> Add category
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Auto-response */}
        <Card className="overflow-hidden p-0">
          <Section
            title="Auto-response rules"
            description="When confidence is high, the AI sends a reply directly. Below the threshold, it prepares a draft for an agent."
            control={<Switch checked={autoResp} onCheckedChange={setAutoResp} />}
          />
          {autoResp && (
            <div className="space-y-4 border-t border-border px-5 py-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-foreground">
                    Confidence threshold
                  </label>
                  <span className="font-mono text-[13px] font-semibold text-ai-muted-foreground">
                    {threshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--ai))]"
                />
                <div className="mt-1 flex justify-between px-0.5 text-[10px] text-muted-foreground">
                  <span>50%</span>
                  <span>65%</span>
                  <span>80%</span>
                  <span>95%</span>
                  <span>100%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  AI only auto-sends when confidence is above{" "}
                  <span className="font-medium text-foreground">{threshold}%</span>.
                  Below this, a draft is prepared for agent review.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <Tier label="High" range="≥ 92%" desc="Auto-send + log" tone="success" />
                <Tier label="Medium" range={`${threshold}–91%`} desc="Auto-send (current)" tone="primary" />
                <Tier label="Low" range={`< ${threshold}%`} desc="Prepare draft for agent" tone="muted" />
              </div>
            </div>
          )}
        </Card>

        {/* Tone */}
        <Card className="overflow-hidden p-0">
          <Section title="AI reply tone" description="How the AI sounds when it replies to customers." />
          <div className="border-t border-border px-5 py-4">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TONE_SAMPLES) as Tone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "relative rounded-md border-2 p-3 text-left transition-colors",
                    tone === t
                      ? "border-primary bg-primary-muted/50"
                      : "border-border bg-card hover:border-muted-foreground/40",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[13px] font-semibold capitalize text-foreground">
                      {t}
                    </span>
                    {tone === t && (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {t === "professional"
                      ? "Calm, neutral, business"
                      : t === "friendly"
                        ? "Warm, casual, light emoji"
                        : "Short, direct, no filler"}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-md border border-ai-border bg-ai-muted/60 p-3.5">
              <AiBadge label="Live preview" />
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/90">
                {TONE_SAMPLES[tone]}
              </p>
            </div>
          </div>
        </Card>

        {/* Escalation */}
        <Card className="overflow-hidden p-0">
          <Section
            title="Escalation triggers"
            description="The AI hands off to a human agent when any of these are true."
          />
          <div className="space-y-1 border-t border-border px-5 py-3">
            <EscalationItem
              on={escalate.frustrated}
              onChange={(v) => setEscalate((e) => ({ ...e, frustrated: v }))}
            >
              Customer sentiment is <span className="font-medium">Frustrated</span>
            </EscalationItem>
            <EscalationItem
              on={escalate.enterprise}
              onChange={(v) => setEscalate((e) => ({ ...e, enterprise: v }))}
            >
              Customer is on the <Badge tone="primary">Enterprise</Badge> plan
            </EscalationItem>
            <EscalationItem
              on={escalate.reopened}
              onChange={(v) => setEscalate((e) => ({ ...e, reopened: v }))}
            >
              Ticket has been reopened{" "}
              <span className="font-medium">more than twice</span>
            </EscalationItem>
            <EscalationItem
              on={escalate.stale}
              onChange={(v) => setEscalate((e) => ({ ...e, stale: v }))}
            >
              <span className="inline-flex flex-wrap items-center gap-1.5">
                No agent reply in
                <input
                  type="number"
                  value={staleHours}
                  onChange={(e) => setStaleHours(Number(e.target.value))}
                  className="h-7 w-12 rounded border border-border px-2 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                hours
              </span>
            </EscalationItem>
          </div>
        </Card>

        {/* System prompt */}
        <Card className="overflow-hidden p-0">
          <Section
            title="AI persona & instructions"
            description="A custom system prompt that shapes how the AI replies. Use plain language."
          />
          <div className="border-t border-border px-5 py-4">
            <div className="mb-3 flex items-center gap-2 rounded-md border border-warning-border bg-warning-muted p-2.5">
              <AlertCircle size={14} className="flex-shrink-0 text-warning-muted-foreground" />
              <span className="text-xs text-warning-muted-foreground">
                Changes affect all AI responses. Test with a few tickets before
                saving broadly.
              </span>
            </div>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              className="font-mono text-xs"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{systemPrompt.length} / 2,000 characters</span>
              <button className="inline-flex items-center gap-1 font-medium text-ai-muted-foreground hover:opacity-80">
                <Wand2 size={11} /> Help me write this
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 border-t border-border bg-card/90 shadow-[0_-2px_8px_rgb(16_24_40_/_0.04)] backdrop-blur">
        <div className="mx-auto flex max-w-[760px] items-center justify-between px-8 py-3">
          <span className="text-xs text-muted-foreground">
            Last saved 2 minutes ago by Priya Raman
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Discard
            </Button>
            <Button
              size="sm"
              icon={Check}
              onClick={() =>
                toast.success("Triage rules saved")
              }
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {control && <div className="flex-shrink-0 pt-1">{control}</div>}
    </div>
  );
}

function Tier({
  label,
  range,
  desc,
  tone,
}: {
  label: string;
  range: string;
  desc: string;
  tone: "success" | "primary" | "muted";
}) {
  const border = {
    success: "border-success-border bg-success-muted/40",
    primary: "border-primary-border bg-primary-muted/40",
    muted: "border-border bg-muted/40",
  }[tone];
  return (
    <div className={cn("rounded-md border p-3", border)}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{range}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{desc}</div>
    </div>
  );
}

function EscalationItem({
  on,
  onChange,
  children,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2">
      <button
        type="button"
        onClick={() => onChange(!on)}
        className={cn(
          "inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2",
          on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
        )}
      >
        {on && <Check size={10} />}
      </button>
      <span className="text-[13px] text-foreground/90">{children}</span>
    </label>
  );
}

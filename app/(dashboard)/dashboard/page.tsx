import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  LayoutTemplate,
  type LucideIcon,
  MessageSquare,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CHANNELS } from "@/lib/conversation-data";
import { CHANNEL_GLYPH } from "@/components/icons/channels";
import { AiSparkle } from "@/components/shared/ai-sparkle";
import { PageHeader } from "@/components/shared/page-header";
import {
  ACTION_ITEMS,
  CHANNEL_PERF,
  ECONOMICS,
  ESCALATIONS,
  FUNNEL,
  HOURLY_HEATMAP,
  RESPONSE,
  type ActionItem,
  type ChannelPerf,
  type EscalationReason,
} from "./data";

const RANGES = [
  { id: "1d", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
] as const;

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function frt(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <PageHeader
        title="Dashboard"
        subtitle="Your AI inbox at a glance — where it's winning, where it needs help."
        action={<RangeTabs />}
      />

      <div className="mx-auto max-w-[1180px] space-y-5 px-8 py-6">
        <PreviewBanner />

        <DeflectionCard />

        <div className="grid grid-cols-[1.4fr_1fr] gap-5">
          <EscalationsCard />
          <ResponseCard />
        </div>

        <HourlyHeatmapCard />

        <ChannelTableCard />

        <div className="grid grid-cols-[1fr_1fr] gap-5">
          <EconomicsCard />
          <ActionItemsCard />
        </div>
      </div>
    </div>
  );
}

function RangeTabs() {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
      {RANGES.map((r) => (
        <button
          key={r.id}
          className={cn(
            "h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors",
            r.id === "30d"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:text-slate-800",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function PreviewBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-violet-200 bg-violet-50/60 px-4 py-2.5 text-[12.5px] text-violet-800">
      <AiSparkle size={13} className="text-violet-600" />
      <span>
        <strong className="font-semibold">Preview data.</strong> Real numbers
        start streaming once the AI worker is live (Phase 4). Layout and
        signals here are how the dashboard will work.
      </span>
    </div>
  );
}

function DeflectionCard() {
  const inbound = FUNNEL.inbound;
  const auto = FUNNEL.autoResolved;
  const good = FUNNEL.highCsat;
  const deflectionPct = Math.round((good / inbound) * 100);
  const autoPct = Math.round((auto / inbound) * 100);
  const escPct = Math.round(((inbound - auto) / inbound) * 100);

  const steps = [
    { key: "inbound", label: "Inbound", value: inbound, pct: 100, tone: "slate" as const },
    { key: "ai", label: "AI attempted", value: FUNNEL.aiAttempted, pct: 100, tone: "slate" as const },
    { key: "auto", label: "AI auto-resolved", value: auto, pct: autoPct, tone: "violet" as const },
    { key: "good", label: "AI + CSAT ≥ 4", value: good, pct: deflectionPct, tone: "emerald" as const },
  ];

  return (
    <div
      id="funnel"
      className="rounded-xl border border-violet-200 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-[1fr_1.6fr] gap-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-wide text-violet-700">
            <AiSparkle size={11} />
            Effective deflection
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[44px] font-semibold tracking-tight text-slate-900">
              {deflectionPct}%
            </span>
            <span className="inline-flex items-center gap-0.5 text-[12.5px] font-medium text-emerald-700">
              <TrendingUp size={13} /> +6pt
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
            of conversations the AI handled end-to-end{" "}
            <strong className="text-slate-700">and</strong> the customer rated
            CSAT ≥ 4 — the only number that matters.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <Stat label="Volume" value={fmt(inbound)} sub="last 30 days" />
            <Stat
              label="Escalated to agent"
              value={`${escPct}%`}
              sub={`${fmt(inbound - auto)} conversations`}
              tone="amber"
            />
          </div>
        </div>

        <div>
          <div className="mb-3 text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
            Funnel
          </div>
          <div className="space-y-2.5">
            {steps.map((s) => (
              <FunnelRow
                key={s.key}
                label={s.label}
                value={s.value}
                pct={s.pct}
                tone={s.tone}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number;
  pct: number;
  tone: "slate" | "violet" | "emerald";
}) {
  const bg =
    tone === "slate"
      ? "bg-slate-200"
      : tone === "violet"
        ? "bg-violet-500"
        : "bg-emerald-500";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-700">
          {fmt(value)}{" "}
          <span className="ml-1 text-[11px] text-slate-400">{pct}%</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", bg)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "amber";
}) {
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[20px] font-semibold tracking-tight",
          tone === "amber" ? "text-amber-700" : "text-slate-900",
        )}
      >
        {value}
      </div>
      {sub ? <div className="text-[11px] text-slate-400">{sub}</div> : null}
    </div>
  );
}

function EscalationsCard() {
  const max = Math.max(...ESCALATIONS.map((e) => e.pct));
  return (
    <Card>
      <CardHeader
        title="Where the AI escalates"
        subtitle="Top reasons humans had to step in. Fix the top of this list and deflection goes up."
      />
      <div className="space-y-3">
        {ESCALATIONS.map((e) => (
          <EscalationRow key={e.reason} item={e} max={max} />
        ))}
      </div>
    </Card>
  );
}

function EscalationRow({
  item,
  max,
}: {
  item: EscalationReason;
  max: number;
}) {
  const widthPct = (item.pct / max) * 100;
  const trendUp = item.deltaPct > 0;
  const trendDown = item.deltaPct < 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="flex-1 truncate text-[13px] text-slate-700">
          {item.reason}
        </span>
        <span className="text-[12px] font-medium text-slate-700">
          {item.pct.toFixed(1)}%
        </span>
        <span className="w-12 text-right text-[11px] text-slate-400">
          {fmt(item.count)}
        </span>
        <span
          className={cn(
            "inline-flex w-12 items-center justify-end gap-0.5 text-[11px] font-medium",
            trendUp
              ? "text-amber-600"
              : trendDown
                ? "text-emerald-600"
                : "text-slate-400",
          )}
        >
          {trendUp ? <TrendingUp size={11} /> : null}
          {trendDown ? <TrendingDown size={11} /> : null}
          {item.deltaPct > 0
            ? `+${item.deltaPct}%`
            : item.deltaPct < 0
              ? `${item.deltaPct}%`
              : "flat"}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full",
            trendUp
              ? "bg-amber-400"
              : trendDown
                ? "bg-emerald-400"
                : "bg-slate-300",
          )}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      {item.suggest && item.suggest.kind !== "ok" ? (
        <Link
          href={item.suggest.href}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800"
        >
          <AiSparkle size={10} />
          {item.suggest.kind === "kb"
            ? "Suggest: add a KB article"
            : "Suggest: create a template"}
          <ArrowRight size={11} />
        </Link>
      ) : null}
    </div>
  );
}

function ResponseCard() {
  const max = Math.max(...RESPONSE.medianFrtTrendSec);
  return (
    <Card>
      <CardHeader
        title="Response & backlog"
        subtitle="First-response time and what's still waiting on a human."
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Median first response
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[28px] font-semibold tracking-tight text-slate-900">
              {frt(RESPONSE.medianFrtSec)}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-700">
              <TrendingDown size={11} />
              −2m 40s
            </span>
          </div>
          <div className="mt-2 flex h-12 items-end gap-0.5">
            {RESPONSE.medianFrtTrendSec.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-slate-300"
                style={{ height: `${(v / max) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-1 text-[10.5px] text-slate-400">
            14 days — lower is better
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Backlog
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[28px] font-semibold tracking-tight text-slate-900">
              {RESPONSE.currentBacklog}
            </span>
            <span className="text-[12px] text-slate-400">
              waiting · target ≤ {RESPONSE.backlogTarget}
            </span>
          </div>
          <BacklogGauge
            current={RESPONSE.currentBacklog}
            target={RESPONSE.backlogTarget}
          />
          <div className="mt-2 text-[11.5px] text-slate-500">
            Oldest waiting:{" "}
            <Link
              href="/conversations?tab=waiting"
              className="font-medium text-slate-700 hover:text-indigo-700"
            >
              {RESPONSE.oldestWaiting}
              <ArrowUpRight size={11} className="ml-0.5 inline" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function BacklogGauge({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const max = Math.max(target * 4, current * 1.2);
  const pct = Math.min(100, (current / max) * 100);
  const targetPct = (target / max) * 100;
  const over = current > target;
  return (
    <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn(
          "h-full rounded-full",
          over ? "bg-amber-400" : "bg-emerald-400",
        )}
        style={{ width: `${pct}%` }}
      />
      <span
        className="absolute -top-0.5 h-3 w-px bg-slate-400"
        style={{ left: `${targetPct}%` }}
        title={`Target ≤ ${target}`}
      />
    </div>
  );
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_TICKS = [0, 6, 12, 18, 23];

function heatColor(v: number): string {
  if (v < 5) return "bg-slate-100";
  if (v < 20) return "bg-violet-100";
  if (v < 40) return "bg-violet-200";
  if (v < 60) return "bg-violet-300";
  if (v < 80) return "bg-violet-400";
  return "bg-violet-500";
}

function HourlyHeatmapCard() {
  return (
    <Card>
      <CardHeader
        title="When customers reach out"
        subtitle="Inbound volume by hour of day, last 7 days. Use it to plan staffing — and to know when AI carries the load alone."
      />
      <div className="grid grid-cols-[40px_1fr] gap-2">
        <div className="flex flex-col justify-between pt-1 text-right">
          {DAY_LABELS.map((d) => (
            <span key={d} className="text-[11px] text-slate-400">
              {d}
            </span>
          ))}
        </div>
        <div>
          <div
            className="grid gap-1"
            style={{ gridTemplateRows: "repeat(7, 18px)" }}
          >
            {HOURLY_HEATMAP.map((row, d) => (
              <div
                key={d}
                className="grid gap-[3px]"
                style={{ gridTemplateColumns: "repeat(24, 1fr)" }}
              >
                {row.map((v, h) => (
                  <div
                    key={h}
                    className={cn("h-full rounded-sm", heatColor(v))}
                    title={`${DAY_LABELS[d]} ${h}:00 — intensity ${v}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-400">
            <div className="flex gap-3">
              {HOUR_TICKS.map((h) => (
                <span key={h}>{h.toString().padStart(2, "0")}:00</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span>Quiet</span>
              <div className="flex gap-0.5">
                {[0, 20, 40, 60, 80, 100].map((v) => (
                  <span
                    key={v}
                    className={cn("h-3 w-3 rounded-sm", heatColor(v))}
                  />
                ))}
              </div>
              <span>Busy</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ChannelTableCard() {
  return (
    <Card padding="p-0">
      <div className="p-5">
        <CardHeader
          title="Channel performance"
          subtitle="Volume and quality split by channel. Click a row to see its conversations."
          noMargin
        />
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/60 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            <th className="px-5 py-2.5 text-left">Channel</th>
            <th className="px-5 py-2.5 text-right">Conversations</th>
            <th className="px-5 py-2.5 text-right">AI rate</th>
            <th className="px-5 py-2.5 text-right">Median FRT</th>
            <th className="px-5 py-2.5 text-right">CSAT</th>
            <th className="px-3 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {CHANNEL_PERF.map((c) => (
            <ChannelRow key={c.id} c={c} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ChannelRow({ c }: { c: ChannelPerf }) {
  const ch = CHANNELS[c.id];
  const Glyph = CHANNEL_GLYPH[c.id];
  return (
    <tr className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50">
      <td className="px-5 py-3">
        <Link
          href={`/conversations?channel=${c.id}`}
          className="inline-flex items-center gap-2.5 text-slate-800"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white"
            style={{ background: ch.color }}
          >
            <Glyph size={13} />
          </span>
          <span className="font-medium">{ch.label}</span>
        </Link>
      </td>
      <td className="px-5 py-3 text-right font-medium tabular-nums text-slate-700">
        {fmt(c.volume)}
      </td>
      <td className="px-5 py-3 text-right">
        <span className="inline-flex items-center gap-1.5">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${c.aiPct}%` }}
            />
          </div>
          <span className="font-medium tabular-nums text-slate-700">
            {c.aiPct}%
          </span>
        </span>
      </td>
      <td className="px-5 py-3 text-right font-medium tabular-nums text-slate-700">
        {frt(c.medianFrtSec)}
      </td>
      <td className="px-5 py-3 text-right">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium",
            c.csat >= 4.6
              ? "bg-emerald-50 text-emerald-700"
              : c.csat >= 4.3
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700",
          )}
        >
          {c.csat.toFixed(1)}
        </span>
      </td>
      <td className="px-3 py-3 text-right">
        <ArrowRight size={14} className="text-slate-300" />
      </td>
    </tr>
  );
}

function EconomicsCard() {
  const {
    waFees,
    templates,
    sessionReengagementPct,
    aiCostPerResolutionInr,
    agentCostPerResolutionInr,
  } = ECONOMICS;
  const feeDelta = Math.round(
    ((waFees.thisMonth - waFees.lastMonth) / waFees.lastMonth) * 100,
  );
  const total =
    waFees.breakdown.utility +
    waFees.breakdown.marketing +
    waFees.breakdown.authentication;
  return (
    <Card>
      <CardHeader
        title="WhatsApp economics"
        subtitle="What you pay Meta + AI vs. what an agent-hour would cost."
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
            Meta fees · this month
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[18px] font-semibold text-slate-900">
              {inr(waFees.thisMonth)}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                feeDelta > 0 ? "text-amber-600" : "text-emerald-600",
              )}
            >
              {feeDelta > 0 ? "+" : ""}
              {feeDelta}%
            </span>
          </div>
          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="bg-sky-400"
              style={{
                width: `${(waFees.breakdown.utility / total) * 100}%`,
              }}
              title="Utility"
            />
            <div
              className="bg-violet-400"
              style={{
                width: `${(waFees.breakdown.marketing / total) * 100}%`,
              }}
              title="Marketing"
            />
            <div
              className="bg-slate-400"
              style={{
                width: `${(waFees.breakdown.authentication / total) * 100}%`,
              }}
              title="Authentication"
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10.5px] text-slate-500">
            <span>
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
              Utility
            </span>
            <span>
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
              Marketing
            </span>
            <span>
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
              Auth
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
            Cost per resolution
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[18px] font-semibold text-violet-700">
              {inr(aiCostPerResolutionInr)}
            </span>
            <span className="text-[11px] text-slate-500">AI</span>
          </div>
          <div className="text-[11px] text-slate-400">
            vs. {inr(agentCostPerResolutionInr)} per agent-handled — AI is{" "}
            <span className="font-medium text-emerald-700">
              {Math.round(
                agentCostPerResolutionInr / aiCostPerResolutionInr,
              )}
              × cheaper
            </span>
            .
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <Mini label="Approved" value={templates.approved} tone="emerald" />
        <Mini label="Pending review" value={templates.pending} tone="amber" />
        <Mini label="Rejected" value={templates.rejected} tone="red" />
      </div>
      <div className="mt-3 text-[11.5px] text-slate-500">
        Session re-engagement (post-24h):{" "}
        <span className="font-medium text-slate-700">
          {sessionReengagementPct}%
        </span>{" "}
        of expired sessions are re-opened via a template.
      </div>
    </Card>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "red";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "amber"
        ? "text-amber-700"
        : "text-red-700";
  return (
    <div className="text-center">
      <div className={cn("text-[20px] font-semibold tabular-nums", toneClass)}>
        {value}
      </div>
      <div className="text-[10.5px] uppercase tracking-wide text-slate-400">
        {label}
      </div>
    </div>
  );
}

const ACTION_ICON: Record<ActionItem["icon"], LucideIcon> = {
  templates: LayoutTemplate,
  ai: Sparkles,
  session: Clock,
  team: UsersRound,
  channel: MessageSquare,
};

const SEVERITY_STYLES = {
  warning: {
    icon: "text-amber-600 bg-amber-50",
    border: "border-l-amber-400",
    chip: AlertTriangle,
  },
  info: {
    icon: "text-violet-600 bg-violet-50",
    border: "border-l-violet-400",
    chip: BookOpen,
  },
  good: {
    icon: "text-emerald-600 bg-emerald-50",
    border: "border-l-emerald-400",
    chip: CheckCircle2,
  },
} as const;

function ActionItemsCard() {
  return (
    <Card>
      <CardHeader
        title="Needs your attention"
        subtitle="The things this dashboard noticed for you."
      />
      <div className="space-y-2">
        {ACTION_ITEMS.map((it) => {
          const Icon = ACTION_ICON[it.icon];
          const s = SEVERITY_STYLES[it.severity];
          return (
            <Link
              key={it.id}
              href={it.href}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-slate-100 border-l-4 bg-white p-3 hover:border-slate-200 hover:shadow-sm",
                s.border,
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md",
                  s.icon,
                )}
              >
                <Icon size={14} />
              </span>
              <div className="flex-1">
                <div className="text-[13px] leading-snug text-slate-700">
                  {it.text}
                </div>
                <div className="mt-1 inline-flex items-center gap-0.5 text-[11.5px] font-medium text-indigo-600">
                  {it.cta} <ChevronRight size={11} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function Card({
  children,
  padding = "p-5",
}: {
  children: React.ReactNode;
  padding?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        padding,
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  noMargin,
}: {
  title: string;
  subtitle?: string;
  noMargin?: boolean;
}) {
  return (
    <div className={cn(!noMargin && "mb-4")}>
      <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
      {subtitle ? (
        <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { CHANNELS, type ChannelId } from "@/lib/conversation-data";
import { CHANNEL_GLYPH } from "@/components/icons/channels";
import { AiSparkle } from "@/components/shared/ai-sparkle";
import { PageHeader } from "@/components/shared/page-header";
import { MiniBars } from "@/components/analytics/mini-bars";

const KPIS: {
  label: string;
  value: string;
  delta: string;
  sub: string;
  ai?: boolean;
}[] = [
  { label: "AI resolution rate", value: "71%", delta: "+6pt", ai: true, sub: "resolved with no human" },
  { label: "Conversations", value: "3,418", delta: "+12%", sub: "last 30 days" },
  { label: "Median first response", value: "38s", delta: "−2m 40s", sub: "AI answers instantly" },
  { label: "CSAT", value: "4.7", delta: "+0.1", sub: "out of 5 · 612 ratings" },
];

const CHANNEL_MIX: { id: ChannelId; pct: number }[] = [
  { id: "whatsapp", pct: 68 },
  { id: "instagram", pct: 14 },
  { id: "web", pct: 10 },
  { id: "messenger", pct: 5 },
  { id: "email", pct: 3 },
];

const DAYS = [62, 71, 58, 74, 80, 69, 77, 85, 79, 88, 92, 84, 90, 96];
const AI_SHARE = [44, 52, 41, 55, 60, 49, 58, 64, 58, 67, 71, 63, 69, 73];

export default function AnalyticsPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <PageHeader
        title="Analytics"
        subtitle="How much your AI is handling — and where humans step in."
      />
      <div className="mx-auto max-w-[1040px] space-y-5 px-8 py-7">
        <div className="grid grid-cols-4 gap-4">
          {KPIS.map((k) => (
            <div
              key={k.label}
              className={cn(
                "rounded-xl border border-slate-200 bg-white p-4",
                k.ai && "border-violet-200 bg-violet-50/30",
              )}
            >
              <div
                className={cn(
                  "text-[11.5px] font-medium",
                  k.ai
                    ? "inline-flex items-center gap-1 text-violet-700"
                    : "text-slate-500",
                )}
              >
                {k.ai ? <AiSparkle size={11} /> : null}
                {k.label}
              </div>
              <div className="mt-1 text-[26px] font-semibold tracking-tight text-slate-900">
                {k.value}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11.5px] font-medium text-emerald-700">
                  {k.delta}
                </span>
                <span className="text-[11px] text-slate-400">{k.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1.6fr_1fr] gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-slate-900">
                  Conversations &amp; AI share
                </h3>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  Daily volume vs. % handled fully by AI
                </p>
              </div>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Total
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                  AI-resolved
                </span>
              </div>
            </div>
            <MiniBars total={DAYS} ai={AI_SHARE} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-[14px] font-semibold text-slate-900">
              Channel mix
            </h3>
            <div className="space-y-3">
              {CHANNEL_MIX.map((c) => {
                const ch = CHANNELS[c.id];
                const Glyph = CHANNEL_GLYPH[c.id];
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span
                      className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-white"
                      style={{ background: ch.color }}
                    >
                      <Glyph size={12} />
                    </span>
                    <span className="w-20 text-[12.5px] text-slate-700">
                      {ch.label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, background: ch.color }}
                      />
                    </div>
                    <span className="w-9 text-right text-[12px] font-medium text-slate-600">
                      {c.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

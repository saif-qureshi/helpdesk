import { ArrowDown, ArrowUp, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SettingsHeader } from "@/components/settings/page-header";

const INVOICES = [
  { id: "INV-2026-0521", date: "May 1, 2026", amount: "$1,840.00", status: "Paid" },
  { id: "INV-2026-0420", date: "Apr 1, 2026", amount: "$1,840.00", status: "Paid" },
  { id: "INV-2026-0319", date: "Mar 1, 2026", amount: "$1,680.00", status: "Paid" },
  { id: "INV-2026-0218", date: "Feb 1, 2026", amount: "$1,680.00", status: "Paid" },
  { id: "INV-2026-0117", date: "Jan 1, 2026", amount: "$1,680.00", status: "Paid" },
];

const USAGE_SEGMENTS = [
  { label: "Auto-resolved", value: 18420, color: "#10B981" },
  { label: "Agent-accepted", value: 14210, color: "#8B5CF6" },
  { label: "Agent-discarded", value: 5782, color: "#9CA3AF" },
];

export default function BillingPage() {
  return (
    <div className="min-h-full">
      <SettingsHeader
        title="Billing & plan"
        sub="Manage your subscription, usage, and invoices."
      />
      <div className="mx-auto max-w-[960px] space-y-6 px-8 py-6 pb-16">
        {/* Current plan */}
        <Card className="p-0">
          <div className="flex items-start gap-6 border-b border-border p-6">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge tone="primary">Growth</Badge>
                <span className="text-xs text-muted-foreground">
                  Annual · renews Jan 1, 2027
                </span>
              </div>
              <div className="text-[28px] font-semibold tracking-tight text-foreground">
                $1,840{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / month
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                8 seats · 50K AI replies · unlimited tickets
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" icon={ArrowUp}>
                Upgrade to Enterprise
              </Button>
              <Button variant="ghost" size="sm">
                Change plan
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
            <UsageBar label="AI replies this month" used={38400} cap={50000} tone="ai" />
            <UsageBar label="Seats used" used={8} cap={15} tone="primary" />
            <UsageBar label="Storage" used={24.6} cap={50} unit=" GB" tone="success" />
          </div>
        </Card>

        {/* AI usage breakdown */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles size={14} className="text-ai" /> AI usage breakdown
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                May 2026 · 38,412 of 50,000 included replies
              </p>
            </div>
            <button className="text-xs font-medium text-primary-muted-foreground hover:opacity-80">
              Full report →
            </button>
          </div>
          <UsageStackBar segments={USAGE_SEGMENTS} />
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Overages billed at{" "}
            <span className="font-medium text-foreground">$0.04 per AI reply</span>.
            At current pace you&rsquo;ll use ~46,800 replies this cycle — within
            plan.
          </p>
        </Card>

        {/* Payment method */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Payment method</h3>
            <Button variant="secondary" size="sm">
              Update card
            </Button>
          </div>
          <div className="flex items-center gap-4 rounded-md border border-border bg-muted/40 p-4">
            <div className="inline-flex h-8 w-12 items-center justify-center rounded bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold tracking-wider text-white">
              VISA
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-foreground">
                Visa ending in 4242
              </div>
              <div className="text-[11px] text-muted-foreground">
                Expires 08/2028 · Maya Lindqvist
              </div>
            </div>
            <Badge tone="success" dot>
              Active
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Billing email">
              <Input defaultValue="billing@northwind.io" icon={Mail} />
            </Field>
            <Field label="Tax ID (VAT)">
              <Input defaultValue="GB 123 4567 89" />
            </Field>
          </div>
        </Card>

        {/* Invoices */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Invoices</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sent to billing@northwind.io on the 1st of each month.
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ArrowDown}>
              Download all
            </Button>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 text-left">Invoice</th>
                <th className="px-5 py-2.5 text-left">Date</th>
                <th className="px-5 py-2.5 text-left">Amount</th>
                <th className="px-5 py-2.5 text-left">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-3 font-mono text-xs text-foreground">
                    {inv.id}
                  </td>
                  <td className="px-5 py-3 text-foreground/80">{inv.date}</td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {inv.amount}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone="success" dot>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs font-medium text-primary-muted-foreground hover:opacity-80">
                      <ArrowDown size={11} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Cancel */}
        <Card className="border-danger-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Cancel subscription
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your workspace stays read-only for 30 days after cancellation.
              </p>
            </div>
            <Button variant="dangerGhost" size="sm">
              Cancel plan
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  used,
  cap,
  unit = "",
  tone,
}: {
  label: string;
  used: number;
  cap: number;
  unit?: string;
  tone: "ai" | "primary" | "success";
}) {
  const pct = Math.min(100, (used / cap) * 100);
  const bar = { ai: "bg-ai", primary: "bg-primary", success: "bg-success" }[tone];
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mb-2 flex items-baseline gap-1.5">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          {used.toLocaleString()}
          {unit}
        </span>
        <span className="text-xs text-muted-foreground">
          / {cap.toLocaleString()}
          {unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 text-[11px] text-muted-foreground">
        {Math.round(pct)}% used
      </div>
    </div>
  );
}

function UsageStackBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div
            key={s.label}
            title={`${s.label}: ${s.value.toLocaleString()}`}
            className="h-full"
            style={{ background: s.color, width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-xs text-foreground/80">{s.label}</span>
            <span className="text-xs text-muted-foreground">
              · {s.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

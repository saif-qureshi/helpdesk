import { ArrowDown, ArrowUp, MoreHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsKpi } from "@/types";
import { Card } from "@/components/ui/card";

export function KpiCard({ label, value, delta, trend, sub, ai }: AnalyticsKpi) {
  const positive = trend === "up";
  return (
    <Card className={cn("p-5", ai && "border-ai-border bg-ai-muted/30")}>
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium",
            ai
              ? "inline-flex items-center gap-1 text-ai-muted-foreground"
              : "text-muted-foreground",
          )}
        >
          {ai && <Sparkles size={11} />}
          {label}
        </span>
        <MoreHorizontal size={13} className="text-muted-foreground/50" />
      </div>
      <div className="text-[28px] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            positive ? "text-success-muted-foreground" : "text-danger-muted-foreground",
          )}
        >
          {positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {delta}
        </span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </Card>
  );
}

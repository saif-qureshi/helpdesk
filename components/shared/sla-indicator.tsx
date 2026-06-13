import { CircleCheck, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlaState } from "@/types";

const map: Record<
  SlaState,
  { icon: typeof Clock; className: string; title: string }
> = {
  healthy: { icon: CircleCheck, className: "text-success", title: "SLA healthy" },
  risk: { icon: Clock, className: "text-warning", title: "SLA at risk" },
  breached: { icon: Flame, className: "text-danger", title: "SLA breached" },
};

export function SlaIndicator({
  sla,
  size = 14,
  withLabel = false,
}: {
  sla: SlaState;
  size?: number;
  withLabel?: boolean;
}) {
  const { icon: Icon, className, title } = map[sla];
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      title={title}
    >
      <Icon size={size} />
      {withLabel && <span className="text-xs font-medium capitalize">{sla}</span>}
    </span>
  );
}

import { cn } from "@/lib/utils";
import type { TicketPriority } from "@/types";

const styles: Record<TicketPriority, string> = {
  urgent: "bg-danger",
  high: "bg-warning",
  normal: "bg-primary",
  low: "bg-muted-foreground/50",
};

export function PriorityDot({
  priority,
  size = 8,
  className,
}: {
  priority: TicketPriority;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block rounded-full", styles[priority], className)}
      style={{ width: size, height: size }}
      title={`Priority: ${priority}`}
      aria-label={`Priority ${priority}`}
    />
  );
}

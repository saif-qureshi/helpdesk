import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/types";

const map: Record<
  TicketStatus,
  { tone: "primary" | "warning" | "success" | "gray"; label: string }
> = {
  open: { tone: "primary", label: "Open" },
  pending: { tone: "warning", label: "Pending" },
  resolved: { tone: "success", label: "Resolved" },
  closed: { tone: "gray", label: "Closed" },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { tone, label } = map[status];
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

import { Check, CheckCheck } from "lucide-react";
import type { MessageDelivery } from "@/lib/conversation-data";

export function DeliveryTick({ status }: { status?: MessageDelivery }) {
  if (status === "sent") return <Check size={13} className="text-slate-400" />;
  if (status === "delivered")
    return <CheckCheck size={13} className="text-slate-400" />;
  if (status === "read")
    return <CheckCheck size={13} className="text-sky-500" />;
  return null;
}

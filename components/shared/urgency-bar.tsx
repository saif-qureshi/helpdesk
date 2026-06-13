import { URGENCY_COLOR, type AiUrgency } from "@/lib/conversation-data";

export function UrgencyBar({ urgency }: { urgency: AiUrgency }) {
  return (
    <span
      className="absolute bottom-0 left-0 top-0 w-[3px] rounded-r"
      style={{ background: URGENCY_COLOR[urgency] }}
      title={`AI urgency: ${urgency}`}
    />
  );
}

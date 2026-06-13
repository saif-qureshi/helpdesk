import { cn } from "@/lib/utils";
import { STATE_META, type ConversationState } from "@/lib/conversation-data";
import { AiSparkle } from "@/components/shared/ai-sparkle";

const TONES = {
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
} as const;

const DOT = {
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  slate: "bg-slate-400",
  green: "bg-emerald-500",
} as const;

export function StatePill({
  state,
  size = "md",
}: {
  state: ConversationState;
  size?: "sm" | "md";
}) {
  const meta = STATE_META[state];
  const pad =
    size === "sm" ? "h-5 px-1.5 text-[10.5px]" : "h-6 px-2 text-[11.5px]";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        pad,
        TONES[meta.tone],
      )}
    >
      {state === "AI_HANDLING" ? (
        <AiSparkle size={10} className="text-violet-500" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT[meta.tone])} />
      )}
      {meta.label}
    </span>
  );
}

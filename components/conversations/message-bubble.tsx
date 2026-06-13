import { ArrowRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  agentById,
  type ChannelId,
  type Contact,
  type Message,
} from "@/lib/conversation-data";
import { AiSparkle, AiTag } from "@/components/shared/ai-sparkle";
import { ContactAvatar } from "@/components/shared/contact-avatar";
import { DeliveryTick } from "@/components/shared/delivery-tick";

export function MessageBubble({
  m,
  contact,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  channel: _channel,
}: {
  m: Message;
  contact: Contact;
  channel: ChannelId;
}) {
  if (m.kind === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="inline-flex max-w-[80%] items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-center text-[11px] text-slate-400">
          {m.body.toLowerCase().includes("escalated") ? (
            <ArrowRight size={11} className="text-amber-500" />
          ) : null}
          {m.body}
        </span>
      </div>
    );
  }

  const isIn = m.dir === "in";
  const isAI = m.dir === "out" && m.author === "ai";
  const agent =
    m.dir === "out" && m.author && m.author !== "ai"
      ? agentById(m.author)
      : null;

  return (
    <div className={cn("flex gap-2.5", !isIn && "flex-row-reverse")}>
      {isIn ? (
        <ContactAvatar contact={contact} size={28} />
      ) : isAI ? (
        <div className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white">
          <AiSparkle size={13} />
        </div>
      ) : (
        <ContactAvatar
          contact={
            agent
              ? {
                  initials: agent.initials,
                  color: agent.color,
                  name: agent.name,
                }
              : null
          }
          size={28}
        />
      )}

      <div className={cn("max-w-[70%]", !isIn && "flex flex-col items-end")}>
        <div className="mb-1 flex items-center gap-1.5 px-1">
          <span className="text-[11px] font-medium text-slate-500">
            {isIn
              ? contact.name.split(" ")[0]
              : isAI
                ? "resolv AI"
                : (agent?.name.split(" ")[0] ?? "Agent")}
          </span>
          {isAI ? <AiTag /> : null}
        </div>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
            isIn
              ? "rounded-tl-sm border border-slate-200 bg-white text-slate-800"
              : isAI
                ? "rounded-tr-sm border border-violet-200 bg-violet-50 text-slate-800"
                : "rounded-tr-sm bg-indigo-600 text-white",
          )}
        >
          <p className="whitespace-pre-wrap">{m.body}</p>
          {m.kind === "interactive" && m.buttons ? (
            <div className="mt-2.5 flex flex-col gap-1.5 border-t border-violet-200/60 pt-2.5">
              {m.buttons.map((b, i) => (
                <button
                  key={i}
                  className="w-full rounded-lg border border-violet-200 bg-white py-1.5 text-center text-[12.5px] font-medium text-violet-700 hover:bg-violet-50"
                >
                  {b}
                </button>
              ))}
            </div>
          ) : null}
          {m.kind === "image" ? (
            <div className="mt-2 flex h-32 w-48 items-center justify-center rounded-lg bg-slate-200 text-slate-400">
              <ImageIcon size={24} />
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "mt-1 flex items-center gap-1 px-1",
            !isIn && "flex-row-reverse",
          )}
        >
          <span className="text-[10.5px] text-slate-400">{m.time}</span>
          {!isIn ? <DeliveryTick status={m.delivery} /> : null}
        </div>
      </div>
    </div>
  );
}

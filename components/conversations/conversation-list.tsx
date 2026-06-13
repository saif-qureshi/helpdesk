"use client";

import { useMemo, useState } from "react";
import { Filter, MessageSquare, MoreHorizontal, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CHANNELS,
  CONVERSATIONS,
  STATE_META,
  contactById,
  type ChannelId,
  type Conversation,
} from "@/lib/conversation-data";
import { CHANNEL_GLYPH } from "@/components/icons/channels";
import { AiSparkle } from "@/components/shared/ai-sparkle";
import { ContactAvatar } from "@/components/shared/contact-avatar";
import { StatePill } from "@/components/shared/state-pill";
import { UrgencyBar } from "@/components/shared/urgency-bar";

type Tab = "waiting" | "ai" | "mine" | "all" | "resolved";

const TONE_BG: Record<Conversation["state"], string> = {
  WAITING_AGENT: "bg-amber-50 text-amber-700",
  AI_HANDLING: "bg-violet-50 text-violet-700",
  ASSIGNED: "bg-slate-100 text-slate-600",
  RESOLVED: "bg-emerald-50 text-emerald-700",
};

export function ConversationList({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("waiting");
  const [channelFilter, setChannelFilter] = useState<ChannelId[]>([]);
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      waiting: CONVERSATIONS.filter((c) => c.state === "WAITING_AGENT").length,
      ai: CONVERSATIONS.filter((c) => c.state === "AI_HANDLING").length,
      mine: CONVERSATIONS.filter(
        (c) => c.state === "ASSIGNED" && c.assigneeId === "me",
      ).length,
    }),
    [],
  );

  const filtered = useMemo(() => {
    let list = CONVERSATIONS;
    if (tab === "waiting") list = list.filter((c) => c.state === "WAITING_AGENT");
    else if (tab === "ai") list = list.filter((c) => c.state === "AI_HANDLING");
    else if (tab === "mine")
      list = list.filter((c) => c.state === "ASSIGNED" && c.assigneeId === "me");
    else if (tab === "resolved")
      list = list.filter((c) => c.state === "RESOLVED");

    if (channelFilter.length)
      list = list.filter((c) => channelFilter.includes(c.channel));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const ct = contactById(c.contactId);
        const last = c.messages[c.messages.length - 1];
        return (
          ct?.name.toLowerCase().includes(q) ||
          (last?.body || "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [tab, channelFilter, search]);

  return (
    <div className="flex h-full w-[384px] flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-[17px] font-semibold text-slate-900">
            Conversations
          </h1>
          <div className="flex items-center gap-1">
            <IconBtn>
              <Filter size={16} />
            </IconBtn>
            <IconBtn>
              <MoreHorizontal size={16} />
            </IconBtn>
          </div>
        </div>
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-slate-100 px-3 py-2">
        <TabBtn active={tab === "waiting"} onClick={() => setTab("waiting")} count={counts.waiting} dot>
          Waiting
        </TabBtn>
        <TabBtn active={tab === "ai"} onClick={() => setTab("ai")} count={counts.ai}>
          AI handling
        </TabBtn>
        <TabBtn active={tab === "mine"} onClick={() => setTab("mine")} count={counts.mine}>
          Mine
        </TabBtn>
        <TabBtn active={tab === "all"} onClick={() => setTab("all")}>All</TabBtn>
        <TabBtn active={tab === "resolved"} onClick={() => setTab("resolved")}>
          Resolved
        </TabBtn>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 px-3 py-2">
        {Object.values(CHANNELS).map((ch) => {
          const Glyph = CHANNEL_GLYPH[ch.id];
          const on = channelFilter.includes(ch.id);
          return (
            <button
              key={ch.id}
              onClick={() =>
                setChannelFilter(
                  on
                    ? channelFilter.filter((x) => x !== ch.id)
                    : [...channelFilter, ch.id],
                )
              }
              className={cn(
                "inline-flex h-7 flex-shrink-0 items-center gap-1.5 rounded-lg border px-2 text-[11.5px] font-medium transition-colors",
                on
                  ? "border-transparent text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
              style={on ? { background: ch.color } : undefined}
            >
              <Glyph size={12} /> {ch.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <MessageSquare size={26} />
            </div>
            <h4 className="text-[15px] font-semibold text-slate-900">
              Nothing here
            </h4>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-slate-500">
              No conversations match. Try another tab or clear the channel filter.
            </p>
          </div>
        ) : (
          filtered.map((cv) => (
            <ConversationRow
              key={cv.id}
              cv={cv}
              active={cv.id === activeId}
              onClick={() => onSelect(cv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ConversationRow({
  cv,
  active,
  onClick,
}: {
  cv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  const contact = contactById(cv.contactId);
  const last = cv.messages[cv.messages.length - 1]!;
  const isAiLast = last.dir === "out" && last.author === "ai";
  const [hover, setHover] = useState(false);
  if (!contact) return null;

  const subtitle =
    cv.channel === "email"
      ? contact.email
      : cv.channel === "instagram"
        ? contact.handle
        : contact.phone;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "relative flex cursor-pointer gap-3 border-b border-slate-50 py-3 pl-4 pr-3",
        active ? "bg-indigo-50/60" : "hover:bg-slate-50",
      )}
    >
      <UrgencyBar urgency={cv.aiUrgency} />
      {active ? (
        <span className="absolute bottom-0 right-0 top-0 w-[2px] bg-indigo-600" />
      ) : null}
      <ContactAvatar contact={contact} size={42} channel={cv.channel} />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="truncate text-[13.5px] font-semibold text-slate-900">
            {contact.name}
          </span>
          <span className="truncate text-[11px] text-slate-400">{subtitle}</span>
          <span className="ml-auto flex-shrink-0 text-[11px] text-slate-400">
            {cv.lastAt}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <p className="flex-1 truncate text-[12.5px] leading-snug text-slate-500">
            {isAiLast ? (
              <span className="mr-1 inline-flex items-center font-semibold text-violet-600">
                <AiSparkle size={9} className="-mt-0.5 inline" />
              </span>
            ) : null}
            {last.dir === "out" && last.author === "me" ? (
              <span className="text-slate-400">You: </span>
            ) : null}
            {last.body}
          </p>
          {cv.unread ? (
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600" />
          ) : null}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          {hover || active ? (
            <StatePill state={cv.state} size="sm" />
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                TONE_BG[cv.state],
              )}
            >
              {cv.aiCategory}
            </span>
          )}
          {cv.state === "WAITING_AGENT" && cv.waitingFor ? (
            <span className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-amber-600">
              ⏱ {cv.waitingFor}
            </span>
          ) : null}
          {/* Keep STATE_META referenced (tones derived above) */}
          <span className="hidden">{STATE_META[cv.state].label}</span>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
      {children}
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  count,
  dot,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium transition-colors",
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
      )}
    >
      {children}
      {count != null && count > 0 ? (
        <span
          className={cn(
            "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
            dot ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

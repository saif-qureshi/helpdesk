"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  Ban,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  MoreHorizontal,
  PanelRight,
  RotateCcw,
  Send,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AGENTS,
  AI_SUGGESTIONS,
  CHANNELS,
  agentById,
  contactById,
  type Conversation,
  type Message,
} from "@/lib/conversation-data";
import { AiSparkle } from "@/components/shared/ai-sparkle";
import { ChannelBadge } from "@/components/shared/channel-mark";
import { ContactAvatar } from "@/components/shared/contact-avatar";
import { StatePill } from "@/components/shared/state-pill";
import { MessageBubble } from "@/components/conversations/message-bubble";
import { ReplyComposer } from "@/components/conversations/reply-composer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConversationDetail({
  cv,
  contextOpen,
  onToggleContext,
}: {
  cv: Conversation;
  contextOpen: boolean;
  onToggleContext: () => void;
}) {
  const contact = contactById(cv.contactId)!;
  const assignee = cv.assigneeId ? agentById(cv.assigneeId) : null;
  const channel = CHANNELS[cv.channel];

  const [summaryOpen, setSummaryOpen] = useState(true);
  const [suggestionOpen, setSuggestionOpen] = useState(
    cv.state === "WAITING_AGENT",
  );
  const [localMsgs, setLocalMsgs] = useState<Message[]>(cv.messages);
  const [pendingDraft, setPendingDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const sessionExpired =
    cv.channel === "whatsapp" && cv.session && !cv.session.open;

  useEffect(() => {
    setLocalMsgs(cv.messages);
    setPendingDraft("");
    setSuggestionOpen(cv.state === "WAITING_AGENT");
    setSummaryOpen(true);
  }, [cv.id, cv.messages, cv.state]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMsgs]);

  const suggestion = useMemo(() => AI_SUGGESTIONS[cv.id], [cv.id]);

  const sendReply = (text: string) => {
    setLocalMsgs((m) => [
      ...m,
      {
        id: `l${Date.now()}`,
        dir: "out",
        author: "me",
        kind: "text",
        body: text,
        time: "Now",
        delivery: "sent",
      },
    ]);
    setSuggestionOpen(false);
  };

  const subtitle =
    cv.channel === "email"
      ? contact.email
      : cv.channel === "instagram"
        ? contact.handle
        : contact.phone;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-slate-50">
      <div className="flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <ContactAvatar contact={contact} size={36} channel={cv.channel} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14.5px] font-semibold text-slate-900">
              {contact.name}
            </span>
            <StatePill state={cv.state} size="sm" />
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
            <ChannelBadge channel={cv.channel} withLabel />
            <span>·</span>
            <span>{subtitle}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {assignee ? (
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
              <ContactAvatar
                contact={{
                  initials: assignee.initials,
                  color: assignee.color,
                  name: assignee.name,
                }}
                size={22}
              />
              <span className="hidden lg:inline">
                {assignee.name.split(" ")[0]}
              </span>
            </div>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50">
              <UserPlus size={14} />
              Assign
              <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {AGENTS.map((a) => (
                <DropdownMenuItem key={a.id} className="gap-2">
                  <ContactAvatar
                    contact={{
                      initials: a.initials,
                      color: a.color,
                      name: a.name,
                    }}
                    size={18}
                  />
                  {a.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {cv.state !== "RESOLVED" ? (
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600 px-2.5 text-[12.5px] font-medium text-white hover:bg-emerald-700">
              <CheckCircle2 size={14} />
              Resolve
            </button>
          ) : (
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50">
              <RotateCcw size={14} />
              Re-open
            </button>
          )}

          <button
            onClick={onToggleContext}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              contextOpen
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            )}
          >
            <PanelRight size={16} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="gap-2">
                <Archive size={15} className="text-slate-400" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Bell size={15} className="text-slate-400" />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600">
                <Ban size={15} />
                Block contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-5 overflow-hidden rounded-xl border border-violet-200 bg-violet-50/70">
          <button
            onClick={() => setSummaryOpen((o) => !o)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left"
          >
            <Sparkles size={13} className="text-violet-600" />
            <span className="text-[12px] font-semibold uppercase tracking-wide text-violet-700">
              AI summary
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">
                {cv.aiCategory}
              </span>
              <span className="text-[11px] text-violet-600">
                Sentiment: {cv.sentiment}
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-violet-500 transition-transform",
                  !summaryOpen && "-rotate-90",
                )}
              />
            </div>
          </button>
          {summaryOpen ? (
            <p className="px-4 pb-3.5 text-[13px] leading-relaxed text-slate-700">
              {cv.summary}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {localMsgs.map((m) => (
            <MessageBubble
              key={m.id}
              m={m}
              contact={contact}
              channel={cv.channel}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        {suggestion && suggestionOpen && cv.state !== "RESOLVED" ? (
          <div className="mx-4 mt-3 overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white">
            <div className="flex items-center gap-2 px-4 pb-1 pt-3">
              <AiSparkle size={13} className="text-violet-600" />
              <span className="text-[12px] font-semibold text-violet-700">
                AI suggests a reply
              </span>
              <span className="ml-1 text-[10.5px] text-violet-500">
                {suggestion.confidence}% confidence
              </span>
              <button
                onClick={() => setSuggestionOpen(false)}
                className="ml-auto text-violet-400 hover:text-violet-700"
              >
                <X size={14} />
              </button>
            </div>
            <p className="px-4 py-2 text-[13px] leading-relaxed text-slate-700">
              &ldquo;{suggestion.text}&rdquo;
            </p>
            <div className="flex items-center gap-2 px-4 pb-3">
              <button
                onClick={() => sendReply(suggestion.text)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-600 bg-violet-600 px-2.5 text-[12.5px] font-medium text-white hover:bg-violet-700"
              >
                <Send size={14} />
                Send
              </button>
              <button
                onClick={() => {
                  setPendingDraft(suggestion.text);
                  setSuggestionOpen(false);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-[12.5px] font-medium text-violet-700 hover:bg-violet-100"
              >
                Edit first
              </button>
              <button
                onClick={() => setSuggestionOpen(false)}
                className="inline-flex h-8 items-center rounded-lg px-2.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {sessionExpired ? (
          <div className="mx-4 mt-3 flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5">
            <Clock size={15} className="flex-shrink-0 text-amber-600" />
            <span className="flex-1 text-[12px] text-amber-800">
              The 24-hour WhatsApp window has expired. Send an approved template
              to re-open the conversation.
            </span>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50">
              <Sparkles size={14} />
              Use template
            </button>
          </div>
        ) : null}

        <ReplyComposer
          cv={cv}
          channelLabel={channel.label}
          contactFirstName={contact.name.split(" ")[0] ?? contact.name}
          sessionExpired={sessionExpired}
          initialDraft={pendingDraft}
          onSend={sendReply}
        />
      </div>
    </div>
  );
}

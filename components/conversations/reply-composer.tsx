"use client";

import { useState } from "react";
import { Clock, Paperclip, Send, SmilePlus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  renderTemplate,
  type ChannelId,
  type Conversation,
  type TemplateRecord,
} from "@/lib/conversation-data";
import { TemplatePicker } from "@/components/conversations/template-picker";

export function ReplyComposer({
  cv,
  channelLabel,
  contactFirstName,
  sessionExpired,
  initialDraft,
  onSend,
  onUseTemplate,
}: {
  cv: Conversation;
  channelLabel: string;
  contactFirstName: string;
  sessionExpired: boolean;
  initialDraft: string;
  onSend: (text: string) => void;
  onUseTemplate?: () => void;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [templateOpen, setTemplateOpen] = useState(false);

  void onUseTemplate;
  void (null as unknown as ChannelId);

  const send = (text: string) => {
    if (!text.trim() || sessionExpired) return;
    onSend(text);
    setDraft("");
  };

  const pickTemplate = (t: TemplateRecord) => {
    setDraft(renderTemplate(t));
    setTemplateOpen(false);
  };

  return (
    <div className="p-4">
      <div
        className={cn(
          "rounded-xl border transition-shadow focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100",
          sessionExpired
            ? "border-slate-200 bg-slate-50"
            : "border-slate-200 bg-white",
        )}
      >
        <div className="flex items-center gap-0.5 px-2 pt-1.5">
          <ToolBtn>
            <Paperclip size={15} />
          </ToolBtn>
          <div className="relative">
            <ToolBtn
              active={templateOpen}
              onClick={() => setTemplateOpen((t) => !t)}
            >
              <Sparkles size={15} />
            </ToolBtn>
            {templateOpen ? <TemplatePicker onPick={pickTemplate} /> : null}
          </div>
          <ToolBtn>
            <SmilePlus size={15} />
          </ToolBtn>
          <div className="ml-auto pr-1 text-[11px] text-slate-400">
            {cv.channel === "whatsapp" &&
            cv.session.open &&
            cv.session.hoursLeft != null ? (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> {cv.session.hoursLeft}h session left
              </span>
            ) : null}
          </div>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(draft);
          }}
          placeholder={
            sessionExpired
              ? "Session expired — send a template to re-open"
              : `Reply to ${contactFirstName} on ${channelLabel}…`
          }
          disabled={sessionExpired}
          rows={2}
          className="w-full resize-none bg-transparent px-3 py-2 text-[13px] leading-relaxed placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[11px] text-slate-400">
            <kbd className="font-sans">⌘</kbd>+<kbd className="font-sans">↵</kbd>{" "}
            to send
          </span>
          <button
            onClick={() => send(draft)}
            disabled={!draft.trim() || sessionExpired}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
      )}
    >
      {children}
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WidgetConfig {
  botName: string;
  brandColor: string;
  welcome: string;
  position: "left" | "right";
}

interface ChatMessage {
  id: number;
  role: "user" | "ai";
  text: string;
}

const QUICK_ACTIONS = ["Track my order", "Billing question", "Report a bug"];
const AI_REPLY =
  "Thanks for reaching out! I can help with that. Could you share a bit more detail — for example the order number or the email on your account — and I'll pull it up right away.";

export function ChatWidget({ config }: { config: WidgetConfig }) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: value }]);
    setInput("");
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: Date.now() + 1, role: "ai", text: AI_REPLY }]);
    }, 1500);
  };

  const side = config.position === "left" ? "left-5" : "right-5";

  return (
    <>
      {open && (
        <div
          className={cn(
            "absolute bottom-20 z-20 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl",
            side,
          )}
        >
          {/* Header */}
          <div className="p-4 text-white" style={{ background: config.brandColor }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Sparkles size={16} />
                </span>
                <div>
                  <div className="text-sm font-semibold">{config.botName}</div>
                  <div className="text-[11px] text-white/80">
                    Typically replies in minutes
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-white/80 hover:bg-white/15 hover:text-white"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 && (
              <>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white p-3 text-[13px] leading-relaxed text-slate-700 shadow-sm">
                  {config.welcome}
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                      style={{ borderColor: `${config.brandColor}40` }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl p-3 text-[13px] leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm bg-white text-slate-700",
                  )}
                  style={m.role === "user" ? { background: config.brandColor } : undefined}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="h-9 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: config.brandColor }}
                aria-label="Send"
              >
                <Send size={15} />
              </button>
            </form>
            <div className="mt-2 text-center text-[10px] text-slate-400">
              Powered by {config.botName}
            </div>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "absolute bottom-5 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105",
          side,
        )}
        style={{ background: config.brandColor }}
        aria-label="Open chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}

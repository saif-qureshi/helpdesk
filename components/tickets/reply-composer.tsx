"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Check,
  Italic,
  Link2,
  List,
  Paperclip,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AiBadge } from "@/components/shared/ai-badge";

const DRAFT =
  "Hi Sarah,\n\nThanks for the update — really glad to hear everyone is back in. You're absolutely right that this should be called out more clearly. I've filed a docs update (DOC-1184) and asked our team to add an inline banner on the SAML config page after a certificate rotation, prompting admins to click \"Re-validate connection.\"\n\nYou should see the banner roll out within the next release cycle. I'll keep this ticket open for 24 hours in case anything else surfaces, then resolve it.\n\nThanks again for the patient walkthrough.";

type DraftState = "idle" | "streaming" | "ready";

export function ReplyComposer({ customerName }: { customerName: string }) {
  const [text, setText] = useState("");
  const [internalNote, setInternalNote] = useState(false);
  const [draftState, setDraftState] = useState<DraftState>("idle");
  const [draftText, setDraftText] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimer(), []);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function startDraft() {
    clearTimer();
    setDraftState("streaming");
    setDraftText("");
    const words = DRAFT.split(/(\s+)/);
    let i = 0;
    const tick = () => {
      if (i >= words.length) {
        setDraftState("ready");
        return;
      }
      setDraftText((prev) => prev + words[i]);
      i += 1;
      timer.current = setTimeout(tick, 22 + Math.random() * 35);
    };
    tick();
  }

  function dismissDraft() {
    clearTimer();
    setDraftState("idle");
    setDraftText("");
  }

  function acceptDraft() {
    clearTimer();
    setText(draftText);
    setDraftState("idle");
    setDraftText("");
  }

  return (
    <div
      className={cn(
        "border-t",
        internalNote ? "border-warning-border bg-warning-muted/40" : "border-border bg-card",
      )}
    >
      {draftState !== "idle" && (
        <div className="border-b border-ai-border bg-ai-muted/60 px-6 py-3">
          <div className="mb-2 flex items-center justify-between">
            <AiBadge
              label={
                draftState === "streaming"
                  ? "Drafting a reply…"
                  : "AI draft ready"
              }
            />
            <button
              onClick={dismissDraft}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss draft"
            >
              <X size={14} />
            </button>
          </div>
          <div className="min-h-[40px] whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
            {draftText}
            {draftState === "streaming" && (
              <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-ai align-baseline" />
            )}
          </div>
          {draftState === "ready" && (
            <div className="mt-3 flex items-center gap-2">
              <Button variant="ai" size="sm" icon={Check} onClick={acceptDraft}>
                Accept
              </Button>
              <Button variant="aiGhost" size="sm" icon={Wand2} onClick={acceptDraft}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={dismissDraft}>
                Discard
              </Button>
              <span className="ml-auto text-[11px] text-muted-foreground">
                Confidence: 92% · Tone: professional
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-6 pb-2 pt-3 text-xs">
        <span className="text-muted-foreground">
          Replying to <span className="font-medium text-foreground">{customerName}</span>
        </span>
        <label className="inline-flex cursor-pointer items-center gap-2 text-muted-foreground">
          <Switch checked={internalNote} onCheckedChange={setInternalNote} size="sm" />
          <span>Internal note</span>
        </label>
      </div>

      <div className="px-6 pb-4">
        <div
          className={cn(
            "rounded-md border",
            internalNote ? "border-warning-border bg-warning-muted" : "border-border bg-background",
          )}
        >
          <div
            className={cn(
              "flex h-9 items-center gap-1 border-b px-3",
              internalNote ? "border-warning-border" : "border-border",
            )}
          >
            {[Bold, Italic, Link2, List, Paperclip].map((Icon, i) => (
              <button
                key={i}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
              >
                <Icon size={13} />
              </button>
            ))}
            <div className="ml-auto">
              <Button variant="aiGhost" size="sm" icon={Sparkles} onClick={startDraft}>
                Generate AI draft
              </Button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              internalNote
                ? "Internal note — visible only to your team"
                : `Reply to ${customerName}…`
            }
            rows={4}
            className={cn(
              "w-full resize-none px-3 py-3 text-[13px] leading-relaxed focus:outline-none",
              internalNote
                ? "bg-warning-muted placeholder:text-warning-muted-foreground/60"
                : "bg-background placeholder:text-muted-foreground",
            )}
          />
          <div
            className={cn(
              "flex h-11 items-center justify-between border-t px-3",
              internalNote ? "border-warning-border" : "border-border",
            )}
          >
            <span className="text-[11px] text-muted-foreground">⌘↵ to send</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
              <Button
                variant={internalNote ? "secondary" : "primary"}
                size="sm"
                icon={Send}
              >
                {internalNote ? "Save note" : "Send reply"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

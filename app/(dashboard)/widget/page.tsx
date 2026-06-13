"use client";

import { useState } from "react";
import { Check, Eye, Lock, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChatWidget, type WidgetConfig } from "@/components/widget/chat-widget";

const COLORS = ["#4F46E5", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#0EA5E9", "#111827"];

export default function WidgetPage() {
  const [config, setConfig] = useState<WidgetConfig>({
    botName: "Helix",
    brandColor: "#4F46E5",
    welcome:
      "Hi 👋 I'm here to help. Ask me anything — I can answer most questions instantly and loop in a teammate when needed.",
    position: "right",
  });

  const set = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-8 py-5">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Customer-facing</div>
          <h1 className="text-[22px] font-semibold text-foreground">Chat widget</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            The embeddable chat that appears on your customer&rsquo;s site. Tweak
            it live on the right.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Eye}>
            Preview live
          </Button>
          <Button variant="aiGhost" size="sm" icon={Wand2}>
            Customize
          </Button>
          <Button
            size="sm"
            icon={Check}
            onClick={() =>
              toast.success("Widget published")
            }
          >
            Publish
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Preview inside a browser mockup */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-card">
            {/* Browser chrome */}
            <div className="flex h-9 items-center gap-2 border-b border-border bg-muted/50 px-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="ml-3 inline-flex h-6 max-w-[420px] flex-1 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-[11px] text-muted-foreground">
                <Lock size={10} /> northwind.io/orders
              </div>
            </div>

            {/* Faux page + the widget */}
            <div className="relative h-[600px] overflow-hidden bg-gradient-to-b from-background to-muted/40">
              <div className="pointer-events-none select-none p-8">
                <div className="mb-3 h-3 w-32 rounded bg-muted" />
                <div className="mb-6 h-6 w-72 rounded bg-muted-foreground/20" />
                <div className="mb-6 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-md border border-border bg-card" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 w-full max-w-[460px] rounded bg-muted" />
                  <div className="h-2.5 w-full max-w-[420px] rounded bg-muted" />
                  <div className="h-2.5 w-full max-w-[380px] rounded bg-muted" />
                </div>
              </div>
              <ChatWidget config={config} />
            </div>
          </div>
        </div>

        {/* Live customizer */}
        <aside className="w-[300px] flex-shrink-0 overflow-y-auto border-l border-border bg-card p-5">
          <h2 className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Wand2 size={14} className="text-ai" /> Customize
          </h2>

          <Setting label="Brand color">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => set("brandColor", c)}
                  className={cn(
                    "h-7 w-7 rounded-full ring-offset-2 ring-offset-card transition",
                    config.brandColor === c && "ring-2 ring-foreground/40",
                  )}
                  style={{ background: c }}
                  aria-label={`Use ${c}`}
                />
              ))}
            </div>
          </Setting>

          <Setting label="Launcher position">
            <div className="inline-flex w-full rounded-md border border-border p-0.5">
              {(["left", "right"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => set("position", p)}
                  className={cn(
                    "h-8 flex-1 rounded text-xs font-medium capitalize transition-colors",
                    config.position === p
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </Setting>

          <Setting label="Bot name">
            <input
              value={config.botName}
              onChange={(e) => set("botName", e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Setting>

          <Setting label="Welcome message">
            <Textarea
              value={config.welcome}
              onChange={(e) => set("welcome", e.target.value)}
              rows={4}
            />
          </Setting>
        </aside>
      </div>
    </div>
  );
}

function Setting({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs font-medium text-foreground">{label}</div>
      {children}
    </div>
  );
}

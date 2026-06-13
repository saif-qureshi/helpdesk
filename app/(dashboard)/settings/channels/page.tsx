"use client";

import { useState } from "react";
import {
  Check,
  Globe,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SettingsHeader } from "@/components/settings/page-header";
import {
  GitHubIcon,
  HubSpotIcon,
  JiraIcon,
  LinearIcon,
  SegmentIcon,
  SlackIcon,
} from "@/components/icons/brand-icons";

const INBOXES = [
  { id: "i1", addr: "support@northwind.io", volume: "21,041 tickets · 14d", active: true, source: "Gmail", auto: true },
  { id: "i2", addr: "billing@northwind.io", volume: "3,412 tickets · 14d", active: true, source: "Gmail", auto: true },
  { id: "i3", addr: "security@northwind.io", volume: "184 tickets · 14d", active: true, source: "Outlook", auto: false },
  { id: "i4", addr: "partners@northwind.io", volume: "—", active: false, source: "Forwarding", auto: false },
];

const INTEGRATIONS = [
  { id: "slack", name: "Slack", desc: "Notify a channel on new urgent tickets, escalate from Slack.", connected: true, Icon: SlackIcon },
  { id: "jira", name: "Jira", desc: "Create Jira issues from tickets in two clicks.", connected: true, Icon: JiraIcon },
  { id: "linear", name: "Linear", desc: "Link tickets to Linear issues with auto-sync of status.", connected: false, Icon: LinearIcon },
  { id: "segment", name: "Segment", desc: "Stream events into your Segment workspace.", connected: false, Icon: SegmentIcon },
  { id: "hubspot", name: "HubSpot", desc: "Sync customer + plan data into the ticket sidebar.", connected: false, Icon: HubSpotIcon },
  { id: "github", name: "GitHub", desc: "Link tickets to PRs, post comments back to GitHub.", connected: true, Icon: GitHubIcon },
];

const SNIPPET = `<script>
  (function(w,d){
    w.ResolvWidget = { workspace: "northwind", theme: "indigo" };
    var s = d.createElement("script");
    s.src = "https://widget.resolv.ai/loader.js";
    s.async = true;
    d.head.appendChild(s);
  })(window, document);
</script>`;

export default function ChannelsPage() {
  const [auto, setAuto] = useState<Record<string, boolean>>(
    Object.fromEntries(INBOXES.map((b) => [b.id, b.auto])),
  );

  return (
    <div className="min-h-full">
      <SettingsHeader
        title="Channels"
        sub="Where tickets come from — email inboxes, chat widget, API, and integrations."
        action={
          <Button size="sm" icon={Plus}>
            Add channel
          </Button>
        }
      />
      <div className="mx-auto max-w-[1080px] space-y-6 px-8 py-6 pb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ChannelCard icon={Mail} title="Email" sub="4 inboxes connected" status="Active" tone="primary" lastEvent="Last received · 2m ago" />
          <ChannelCard icon={MessageCircle} title="Chat widget" sub="Embedded on northwind.io + 3 subdomains" status="Live" tone="success" lastEvent="142 conversations today" />
          <ChannelCard icon={Globe} title="API & webhooks" sub="2 active webhooks · 1 API key" status="Active" tone="ai" lastEvent="Last delivery · 14s ago" />
        </div>

        {/* Email inboxes */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Email inboxes</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Forward your support email or connect directly via OAuth.
              </p>
            </div>
            <Button variant="secondary" size="sm" icon={Plus}>
              Add inbox
            </Button>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 text-left">Address</th>
                <th className="px-5 py-2.5 text-left">Source</th>
                <th className="px-5 py-2.5 text-left">Volume</th>
                <th className="px-5 py-2.5 text-left text-ai-muted-foreground">AI auto-reply</th>
                <th className="px-5 py-2.5 text-left">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {INBOXES.map((b) => (
                <tr key={b.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-muted-foreground" />
                      <span className="font-mono text-xs text-foreground">{b.addr}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-foreground/80">{b.source}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{b.volume}</td>
                  <td className="px-5 py-3">
                    <Switch
                      size="sm"
                      checked={auto[b.id] ?? false}
                      onCheckedChange={(v) => setAuto((a) => ({ ...a, [b.id]: v }))}
                    />
                  </td>
                  <td className="px-5 py-3">
                    {b.active ? (
                      <Badge tone="success" dot>
                        Active
                      </Badge>
                    ) : (
                      <Badge tone="gray" dot>
                        Paused
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Widget snippet */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Chat widget — install snippet
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Paste before <span className="font-mono">&lt;/body&gt;</span> on any
                page where the widget should appear.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(SNIPPET).catch(() => undefined);
                toast.success("Snippet copied to clipboard");
              }}
            >
              Copy snippet
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-md bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
            {SNIPPET}
          </pre>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Detected on
            northwind.io · /docs · /pricing
          </div>
        </Card>

        {/* Integrations */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border p-5">
            <h3 className="text-sm font-semibold text-foreground">Integrations</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Connect resolv.ai to the rest of your stack.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
            {INTEGRATIONS.map((i) => (
              <div key={i.id} className="flex items-center gap-3 bg-card p-4">
                <div className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground">
                  <i.Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-foreground">
                    {i.name}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {i.desc}
                  </p>
                </div>
                {i.connected ? (
                  <Button variant="secondary" size="sm" icon={Check}>
                    Configure
                  </Button>
                ) : (
                  <Button size="sm">Connect</Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChannelCard({
  icon: Icon,
  title,
  sub,
  status,
  tone,
  lastEvent,
}: {
  icon: typeof Mail;
  title: string;
  sub: string;
  status: string;
  tone: "primary" | "success" | "ai";
  lastEvent: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground/70">
          <Icon size={16} />
        </div>
        <Badge tone={tone} dot>
          {status}
        </Badge>
      </div>
      <div className="text-[15px] font-semibold text-foreground">{title}</div>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      <div className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
        {lastEvent}
      </div>
    </Card>
  );
}

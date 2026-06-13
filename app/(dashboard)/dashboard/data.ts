import type { ChannelId } from "@/lib/conversation-data";

export const FUNNEL = {
  inbound: 4127,
  aiAttempted: 4127,
  autoResolved: 2932,
  highCsat: 2641,
};

export const VOLUME_14D = [62, 71, 58, 74, 80, 69, 77, 85, 79, 88, 92, 84, 90, 96];
export const AI_RESOLVED_14D = [44, 52, 41, 55, 60, 49, 58, 64, 58, 67, 71, 63, 69, 73];

export interface EscalationReason {
  reason: string;
  category: string;
  count: number;
  pct: number;
  deltaPct: number;
  suggest?:
    | { kind: "kb"; href: string }
    | { kind: "template"; href: string }
    | { kind: "ok" };
}

export const ESCALATIONS: EscalationReason[] = [
  {
    reason: "Refund eligibility on opened products",
    category: "Refund / return",
    count: 218,
    pct: 18.2,
    deltaPct: 12,
    suggest: { kind: "kb", href: "/knowledge?new=refund-opened" },
  },
  {
    reason: "Lost shipment / courier tracking stale",
    category: "Delivery issue",
    count: 173,
    pct: 14.5,
    deltaPct: 8,
    suggest: { kind: "template", href: "/templates?new=lost_shipment" },
  },
  {
    reason: "Address change after shipping",
    category: "Address change",
    count: 142,
    pct: 11.9,
    deltaPct: -3,
    suggest: { kind: "kb", href: "/knowledge?new=address-change-policy" },
  },
  {
    reason: "Couldn't match contact to a Shopify order",
    category: "Order not received",
    count: 118,
    pct: 9.9,
    deltaPct: 4,
    suggest: { kind: "kb", href: "/knowledge?new=identify-by-phone" },
  },
  {
    reason: "Wholesale / pricing negotiation",
    category: "Sales",
    count: 87,
    pct: 7.3,
    deltaPct: 0,
    suggest: { kind: "ok" },
  },
  {
    reason: "Product compatibility — routine advice",
    category: "Product question",
    count: 64,
    pct: 5.4,
    deltaPct: -10,
    suggest: { kind: "ok" },
  },
];

export const RESPONSE = {
  medianFrtSec: 38,
  medianFrtTrendSec: [62, 58, 55, 48, 44, 42, 40, 38, 39, 38, 36, 38, 41, 38],
  currentBacklog: 12,
  backlogTarget: 5,
  oldestWaiting: "1h 04m",
};

// 7 days × 24 hours, intensity 0–100
export const HOURLY_HEATMAP: number[][] = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const base =
      h >= 9 && h <= 22 ? 35 + Math.round(Math.sin((h - 9) / 3) * 25) : 5;
    const dayBoost = d === 5 || d === 6 ? -10 : 0;
    return Math.max(0, Math.min(100, base + dayBoost));
  }),
);

export interface ChannelPerf {
  id: ChannelId;
  volume: number;
  aiPct: number;
  medianFrtSec: number;
  csat: number;
}

export const CHANNEL_PERF: ChannelPerf[] = [
  { id: "whatsapp", volume: 2810, aiPct: 73, medianFrtSec: 28, csat: 4.7 },
  { id: "instagram", volume: 578, aiPct: 65, medianFrtSec: 240, csat: 4.5 },
  { id: "web", volume: 412, aiPct: 81, medianFrtSec: 22, csat: 4.8 },
  { id: "messenger", volume: 207, aiPct: 58, medianFrtSec: 360, csat: 4.3 },
  { id: "email", volume: 120, aiPct: 42, medianFrtSec: 2100, csat: 4.4 },
];

export const ECONOMICS = {
  waFees: {
    currency: "INR",
    thisMonth: 14820,
    lastMonth: 12110,
    breakdown: { utility: 9890, marketing: 4210, authentication: 720 },
  },
  templates: { approved: 14, pending: 3, rejected: 2 },
  sessionReengagementPct: 41,
  aiCostPerResolutionInr: 2.4,
  agentCostPerResolutionInr: 86,
};

export interface ActionItem {
  id: string;
  severity: "warning" | "info" | "good";
  icon: "templates" | "ai" | "session" | "team" | "channel";
  text: string;
  cta: string;
  href: string;
}

export const ACTION_ITEMS: ActionItem[] = [
  {
    id: "ai1",
    severity: "warning",
    icon: "templates",
    text: "2 templates rejected by Meta — fix and resubmit",
    cta: "Review templates",
    href: "/templates?status=rejected",
  },
  {
    id: "ai2",
    severity: "info",
    icon: "ai",
    text: "'Refund / return' escalations up 18% — consider adding a KB article",
    cta: "Draft article",
    href: "/knowledge?new=refund-eligibility",
  },
  {
    id: "ai3",
    severity: "warning",
    icon: "session",
    text: "8 WhatsApp 24h windows expired without an agent reply",
    cta: "Open conversations",
    href: "/conversations?filter=expired",
  },
  {
    id: "ai4",
    severity: "info",
    icon: "team",
    text: "Rohan's CSAT dropped 0.4pt this week — check recent conversations",
    cta: "Open Rohan's queue",
    href: "/conversations?assignee=a2",
  },
  {
    id: "ai5",
    severity: "good",
    icon: "ai",
    text: "AI handled 73% of WhatsApp conversations end-to-end — up 6pt week-over-week",
    cta: "See breakdown",
    href: "#funnel",
  },
];

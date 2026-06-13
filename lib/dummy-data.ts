import type {
  Agent,
  AgentPerformance,
  AnalyticsKpi,
  CategorySlice,
  Customer,
  Message,
  SlaBreach,
  Ticket,
  VolumePoint,
} from "@/types";

/**
 * Realistic mock data for the static UI. Replaced by API data phase-by-phase.
 * Normalized (tickets reference agent/customer ids) — use the lookup helpers.
 */

export const AGENTS: Agent[] = [
  { id: "a1", name: "Maya Lindqvist", initials: "ML", color: "#4F46E5", role: "Senior Agent", isOnline: true },
  { id: "a2", name: "Daniel Okafor", initials: "DO", color: "#0891B2", role: "Agent", isOnline: true },
  { id: "a3", name: "Priya Raman", initials: "PR", color: "#DB2777", role: "Team Lead", isOnline: true },
  { id: "a4", name: "Tomás Herrera", initials: "TH", color: "#F59E0B", role: "Agent", isOnline: true },
  { id: "a5", name: "Ana Brennan", initials: "AB", color: "#10B981", role: "Agent", isOnline: false },
  { id: "a6", name: "Kenji Watanabe", initials: "KW", color: "#7C3AED", role: "Agent", isOnline: false },
  { id: "a7", name: "Hannah Klein", initials: "HK", color: "#EA580C", role: "Agent", isOnline: true },
  { id: "a8", name: "Felix Marchetti", initials: "FM", color: "#0EA5E9", role: "Agent", isOnline: false },
];

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Sarah Chen", email: "sarah.chen@northwind.io", company: "Northwind Analytics", plan: "enterprise", totalTickets: 12, joinedAt: "Mar 2023" },
  { id: "c2", name: "Marcus Bell", email: "marcus@flowstate.dev", company: "Flowstate", plan: "growth", totalTickets: 4, joinedAt: "Jan 2024" },
  { id: "c3", name: "Priti Shah", email: "priti.s@ledgerloop.com", company: "LedgerLoop", plan: "starter", totalTickets: 2, joinedAt: "Nov 2024" },
  { id: "c4", name: "Jordan Avery", email: "j.avery@brightcourse.app", company: "Brightcourse", plan: "growth", totalTickets: 7, joinedAt: "Jul 2024" },
  { id: "c5", name: "Elena Vasquez", email: "elena@quaystack.io", company: "Quaystack", plan: "enterprise", totalTickets: 23, joinedAt: "Feb 2022" },
  { id: "c6", name: "Oliver Trent", email: "oliver@meridianai.co", company: "Meridian AI", plan: "growth", totalTickets: 5, joinedAt: "Sep 2023" },
  { id: "c7", name: "Naomi Park", email: "naomi.p@haloscale.com", company: "Haloscale", plan: "starter", totalTickets: 1, joinedAt: "Apr 2025" },
  { id: "c8", name: "Daniyar Asanov", email: "d.asanov@kindlemetric.app", company: "KindleMetric", plan: "growth", totalTickets: 9, joinedAt: "Oct 2023" },
  { id: "c9", name: "Beatriz Costa", email: "beatriz@sablerouter.com", company: "Sable Router", plan: "enterprise", totalTickets: 18, joinedAt: "May 2022" },
  { id: "c10", name: "Felix Eriksson", email: "felix@northbeam.studio", company: "Northbeam", plan: "growth", totalTickets: 6, joinedAt: "Aug 2024" },
  { id: "c11", name: "Yusuf Demir", email: "yusuf@cargolens.io", company: "Cargolens", plan: "starter", totalTickets: 3, joinedAt: "Jan 2025" },
  { id: "c12", name: "Anya Petrova", email: "anya@axisforge.dev", company: "Axisforge", plan: "enterprise", totalTickets: 31, joinedAt: "Jun 2021" },
  { id: "c13", name: "Liam Walsh", email: "liam@stackpilot.app", company: "Stackpilot", plan: "growth", totalTickets: 8, joinedAt: "Dec 2023" },
  { id: "c14", name: "Mei Lin", email: "mei@cobaltbase.com", company: "Cobaltbase", plan: "growth", totalTickets: 5, joinedAt: "Feb 2024" },
  { id: "c15", name: "Roshan Patel", email: "r.patel@helio.so", company: "Helio", plan: "starter", totalTickets: 2, joinedAt: "Mar 2025" },
];

export const TICKETS: Ticket[] = [
  { id: 1042, customerId: "c1", subject: "SAML SSO failing after rotating signing certificate", category: "Bug", priority: "urgent", status: "open", assigneeId: "a1", updatedLabel: "12m ago", sla: "breached", channel: "email", team: "Engineering", tags: ["sso", "okta", "enterprise"], aiSummary: "Enterprise customer (84 users) locked out of SSO after rotating their SAML signing certificate. Likely missing the new \"Re-validate connection\" step added in the May 12 release.", aiSentiment: "frustrated", aiSentimentConfidence: 94, aiSuggestedArticles: [{ id: "kb1", title: "Setting up SAML SSO with Okta" }, { id: "kb2", title: "Rotating SAML signing certificates" }] },
  { id: 1041, customerId: "c5", subject: "Invoice #INV-2024-9182 charged twice on May 19", category: "Billing", priority: "high", status: "open", assigneeId: "a3", updatedLabel: "38m ago", sla: "risk", channel: "email", team: "Billing", tags: ["billing", "duplicate-charge"], aiSentiment: "neutral", aiSentimentConfidence: 71 },
  { id: 1040, customerId: "c2", subject: "Webhook signature mismatch on /events endpoint", category: "Bug", priority: "high", status: "pending", assigneeId: "a1", updatedLabel: "1h ago", sla: "healthy", channel: "api", team: "Engineering", tags: ["webhooks", "api"] },
  { id: 1039, customerId: "c9", subject: "Bulk export to S3 — request multi-region support", category: "Feature request", priority: "normal", status: "open", assigneeId: "a6", updatedLabel: "1h ago", sla: "healthy", channel: "widget", team: "Product", tags: ["export", "s3"] },
  { id: 1038, customerId: "c4", subject: "Cannot add more than 3 seats on Growth plan", category: "Billing", priority: "high", status: "open", assigneeId: "a3", updatedLabel: "2h ago", sla: "risk", channel: "widget", team: "Billing", tags: ["seats", "plan-limit"] },
  { id: 1037, customerId: "c8", subject: "API rate limit headers missing on retry responses", category: "Bug", priority: "normal", status: "open", assigneeId: "a2", updatedLabel: "2h ago", sla: "healthy", channel: "api", team: "Engineering", tags: ["api", "rate-limit"] },
  { id: 1036, customerId: "c12", subject: "Custom domain SSL — request automatic renewal", category: "Feature request", priority: "normal", status: "pending", assigneeId: "a6", updatedLabel: "3h ago", sla: "healthy", channel: "email", team: "Product", tags: ["ssl", "custom-domain"] },
  { id: 1035, customerId: "c3", subject: "How do I export ticket history as CSV?", category: "General", priority: "low", status: "open", assigneeId: null, updatedLabel: "3h ago", sla: "healthy", channel: "widget", team: "Support", tags: ["export", "how-to"] },
  { id: 1034, customerId: "c6", subject: "Slack integration not posting to private channels", category: "Bug", priority: "high", status: "open", assigneeId: "a4", updatedLabel: "4h ago", sla: "risk", channel: "email", team: "Engineering", tags: ["slack", "integration"] },
  { id: 1033, customerId: "c13", subject: "AI suggestion quality dropped after May 18 release", category: "Bug", priority: "urgent", status: "open", assigneeId: "a1", updatedLabel: "5h ago", sla: "breached", channel: "widget", team: "Engineering", tags: ["ai", "regression"] },
  { id: 1032, customerId: "c7", subject: "Two-factor authentication setup loop on mobile", category: "Bug", priority: "normal", status: "open", assigneeId: "a5", updatedLabel: "6h ago", sla: "healthy", channel: "email", team: "Engineering", tags: ["2fa", "mobile"] },
  { id: 1031, customerId: "c10", subject: "Request: per-agent timezone in scheduled reports", category: "Feature request", priority: "low", status: "open", assigneeId: null, updatedLabel: "8h ago", sla: "healthy", channel: "widget", team: "Product", tags: ["reports", "timezone"] },
  { id: 1030, customerId: "c14", subject: "Pricing question — annual vs monthly for 12 seats", category: "Billing", priority: "normal", status: "open", assigneeId: "a7", updatedLabel: "9h ago", sla: "healthy", channel: "email", team: "Billing", tags: ["pricing"] },
  { id: 1029, customerId: "c11", subject: "Where can I find my API key?", category: "General", priority: "low", status: "resolved", assigneeId: "a5", updatedLabel: "11h ago", sla: "healthy", channel: "widget", team: "Support", tags: ["api", "how-to"] },
  { id: 1028, customerId: "c15", subject: "Migration from Zendesk — bulk import format", category: "General", priority: "normal", status: "open", assigneeId: "a8", updatedLabel: "12h ago", sla: "healthy", channel: "email", team: "Support", tags: ["migration", "import"] },
];

const SAML_CONVERSATION: Message[] = [
  { id: "m1", type: "system", body: "Ticket opened via email — sarah.chen@northwind.io", time: "08:42" },
  { id: "m2", type: "customer", authorId: "c1", time: "08:42", body: "Hi team — we rotated our SAML signing certificate yesterday on schedule and now SSO is failing for all 84 users in our workspace.\n\nUsers get \"Invalid signature on assertion\" when they hit the sign-in screen. We've re-uploaded the new metadata XML twice. Our IdP is Okta. This is blocking everyone — please prioritise." },
  { id: "m3", type: "ai-internal", time: "08:43", body: "Detected: SSO outage on Enterprise customer. Sentiment frustrated (94%). Similar to ticket #931 (resolved Apr 12)." },
  { id: "m4", type: "agent", authorId: "a1", time: "08:51", body: "Hi Sarah — really sorry for the disruption. I'm on this.\n\nQuick check: when you uploaded the new metadata, did you also click \"Re-validate connection\" on the SAML config page? We added that step in the May 12 release and it isn't yet documented in our setup guide." },
  { id: "m5", type: "customer", authorId: "c1", time: "09:04", body: "No — we didn't see that. Just tried it and… everyone's back in. Thank you 🙏\n\nAny chance you can update the docs so this doesn't bite the next admin?" },
  { id: "m6", type: "ai", time: "09:05", reviewedById: "a1", body: "Absolutely — I've filed a docs update with our team (DOC-1184) and added a banner to the SAML config page warning admins to re-validate after rotating certificates. You should see the banner within the next deploy.\n\nGlad your team is back in. I'll keep this ticket open for 24h in case anything else surfaces." },
];

function genericConversation(ticket: Ticket): Message[] {
  return [
    { id: `${ticket.id}-m1`, type: "system", body: `Ticket opened via ${ticket.channel}`, time: "10:00" },
    { id: `${ticket.id}-m2`, type: "customer", authorId: ticket.customerId, time: "10:00", body: `${ticket.subject}.\n\nCould someone take a look when you get a chance? Happy to share more detail.` },
    { id: `${ticket.id}-m3`, type: "ai-internal", time: "10:01", body: `Auto-classified as ${ticket.category} · priority ${ticket.priority}. Routed to ${ticket.team}.` },
  ];
}

export function getConversation(ticketId: number): Message[] {
  if (ticketId === 1042) return SAML_CONVERSATION;
  const ticket = ticketById(ticketId);
  return ticket ? genericConversation(ticket) : [];
}

export const TICKET_CATEGORIES = [
  "Billing",
  "Bug",
  "Feature request",
  "Account Access",
  "Integration Help",
  "General",
] as const;

export const ANALYTICS_KPIS: AnalyticsKpi[] = [
  { label: "Total tickets", value: "1,247", delta: "+12%", trend: "up", sub: "vs. prior 30 days" },
  { label: "AI deflection rate", value: "38.4%", delta: "+5.2pt", trend: "up", sub: "resolved without a human", ai: true },
  { label: "Avg. first response", value: "4m 18s", delta: "-1m 02s", trend: "up", sub: "across all channels" },
  { label: "CSAT", value: "4.72", delta: "+0.08", trend: "up", sub: "out of 5 · 412 responses" },
];

const VOLUME_DAYS = ["May 1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "25", "27", "29", "31"];
const VOLUME_TOTAL = [38, 42, 41, 55, 48, 52, 61, 58, 49, 63, 71, 68, 55, 64, 72, 66];
const VOLUME_AI = [12, 15, 14, 22, 18, 21, 25, 24, 19, 28, 33, 31, 24, 29, 34, 31];

export const VOLUME_30D: VolumePoint[] = VOLUME_DAYS.map((date, i) => ({
  date,
  total: VOLUME_TOTAL[i] ?? 0,
  aiResolved: VOLUME_AI[i] ?? 0,
}));

export const CATEGORY_BREAKDOWN: CategorySlice[] = [
  { name: "Billing", pct: 28, color: "#4F46E5" },
  { name: "Bug", pct: 31, color: "#EF4444" },
  { name: "Feature request", pct: 18, color: "#8B5CF6" },
  { name: "General", pct: 16, color: "#10B981" },
  { name: "Other", pct: 7, color: "#9CA3AF" },
];

export const AGENT_PERFORMANCE: AgentPerformance[] = [
  { agentId: "a1", resolved: 142, avgResponse: "3m 41s", csat: 4.84, aiAcceptRate: 78 },
  { agentId: "a3", resolved: 128, avgResponse: "4m 02s", csat: 4.79, aiAcceptRate: 71 },
  { agentId: "a2", resolved: 117, avgResponse: "5m 13s", csat: 4.68, aiAcceptRate: 64 },
  { agentId: "a6", resolved: 104, avgResponse: "4m 48s", csat: 4.71, aiAcceptRate: 82 },
  { agentId: "a4", resolved: 98, avgResponse: "6m 02s", csat: 4.55, aiAcceptRate: 58 },
  { agentId: "a5", resolved: 91, avgResponse: "4m 55s", csat: 4.66, aiAcceptRate: 69 },
  { agentId: "a7", resolved: 84, avgResponse: "5m 38s", csat: 4.51, aiAcceptRate: 61 },
  { agentId: "a8", resolved: 72, avgResponse: "6m 21s", csat: 4.44, aiAcceptRate: 55 },
];

export const TOP_ARTICLES: { title: string; views: number; aiUses: number }[] = [
  { title: "Setting up SAML SSO with Okta", views: 1843, aiUses: 412 },
  { title: "Webhook signature verification guide", views: 1267, aiUses: 308 },
  { title: "How to upgrade or change your plan", views: 982, aiUses: 287 },
  { title: "Exporting tickets and analytics", views: 754, aiUses: 204 },
  { title: "API rate limits and retry strategy", views: 612, aiUses: 178 },
];

export const SLA_BREACHES: SlaBreach[] = [
  { ticketId: 1042, customerLabel: "Sarah Chen — Northwind Analytics", priority: "urgent", over: "47m", agentId: "a1" },
  { ticketId: 1033, customerLabel: "Liam Walsh — Stackpilot", priority: "urgent", over: "32m", agentId: "a1" },
  { ticketId: 1034, customerLabel: "Oliver Trent — Meridian AI", priority: "high", over: "18m", agentId: "a4" },
  { ticketId: 1038, customerLabel: "Jordan Avery — Brightcourse", priority: "high", over: "12m", agentId: "a3" },
  { ticketId: 1041, customerLabel: "Elena Vasquez — Quaystack", priority: "high", over: "4m", agentId: "a3" },
];

export function customerById(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}
export function agentById(id: string | null | undefined): Agent | undefined {
  return id ? AGENTS.find((a) => a.id === id) : undefined;
}
export function ticketById(id: number): Ticket | undefined {
  return TICKETS.find((t) => t.id === id);
}

export const CURRENT_AGENT = AGENTS[0]!;

/** Domain types for the UI layer (mock data today; wired to the API later). */

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "urgent" | "high" | "normal" | "low";
export type TicketChannel = "email" | "widget" | "api";
export type SlaState = "healthy" | "risk" | "breached";
export type Sentiment = "satisfied" | "neutral" | "frustrated";
export type MessageType =
  | "system"
  | "customer"
  | "agent"
  | "ai"
  | "ai-internal";
export type Plan = "starter" | "growth" | "enterprise";

export interface Agent {
  id: string;
  name: string;
  initials: string;
  /** Avatar background color (hex). */
  color: string;
  role: string;
  isOnline: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: Plan;
  totalTickets: number;
  joinedAt: string;
}

export interface Message {
  id: string;
  type: MessageType;
  body: string;
  /** Agent or customer id, when applicable. */
  authorId?: string;
  /** Display time, e.g. "08:42". */
  time: string;
  isAiGenerated?: boolean;
  /** Agent id who reviewed/approved an AI reply. */
  reviewedById?: string;
}

export interface SuggestedArticle {
  id: string;
  title: string;
}

export interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  category: string;
  customerId: string;
  assigneeId: string | null;
  team: string;
  sla: SlaState;
  /** Relative time label, e.g. "12m ago". */
  updatedLabel: string;
  tags: string[];
  aiSummary?: string;
  aiSentiment?: Sentiment;
  aiSentimentConfidence?: number;
  aiSuggestedArticles?: SuggestedArticle[];
}

export interface AnalyticsKpi {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  sub: string;
  ai?: boolean;
}

export interface VolumePoint {
  date: string;
  total: number;
  aiResolved: number;
}

export interface CategorySlice {
  name: string;
  pct: number;
  color: string;
}

export interface AgentPerformance {
  agentId: string;
  resolved: number;
  avgResponse: string;
  csat: number;
  /** AI draft acceptance rate, 0–100. */
  aiAcceptRate: number;
}

export interface SlaBreach {
  ticketId: number;
  customerLabel: string;
  priority: TicketPriority;
  over: string;
  agentId: string;
}

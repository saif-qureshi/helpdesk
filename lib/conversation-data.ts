export type ChannelId =
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "email"
  | "web"
  | "sms";

export type ConversationState =
  | "WAITING_AGENT"
  | "AI_HANDLING"
  | "ASSIGNED"
  | "RESOLVED";

export type AiUrgency = "low" | "medium" | "high" | "critical";

export interface ChannelMeta {
  id: ChannelId;
  label: string;
  color: string;
  short: string;
}

export const CHANNELS: Record<ChannelId, ChannelMeta> = {
  whatsapp: { id: "whatsapp", label: "WhatsApp", color: "#25D366", short: "WA" },
  instagram: { id: "instagram", label: "Instagram", color: "#E1306C", short: "IG" },
  messenger: { id: "messenger", label: "Messenger", color: "#0084FF", short: "FB" },
  email: { id: "email", label: "Email", color: "#5B6470", short: "@" },
  web: { id: "web", label: "Web chat", color: "#4F46E5", short: "W" },
  sms: { id: "sms", label: "SMS", color: "#0EA5E9", short: "SMS" },
};

export interface AgentMeta {
  id: string;
  name: string;
  initials: string;
  color: string;
  email: string;
  role: string;
}

export const AGENTS: AgentMeta[] = [
  { id: "me", name: "Aisha Khan", initials: "AK", color: "#4F46E5", email: "aisha@bloomandbare.in", role: "Support Lead" },
  { id: "a2", name: "Rohan Mehta", initials: "RM", color: "#0891B2", email: "rohan@bloomandbare.in", role: "Agent" },
  { id: "a3", name: "Divya Nair", initials: "DN", color: "#DB2777", email: "divya@bloomandbare.in", role: "Agent" },
];

export interface ShopifyOrder {
  no: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered";
  total: number;
  courier: string | null;
  tracking: string | null;
  items: string[];
}

export interface ShopifyReturn {
  no: string;
  order: string;
  reason: string;
  status: string;
  item: string;
}

export interface ShopifyCustomer {
  name: string;
  email: string;
  since: string;
  ltv: number;
  orders: ShopifyOrder[];
  returns: ShopifyReturn[];
}

export const SHOPIFY: Record<string, ShopifyCustomer> = {
  sc1: {
    name: "Priya Sharma", email: "priya.sharma@gmail.com", since: "Aug 2024", ltv: 8240,
    orders: [
      { no: "#11432", date: "3 days ago", status: "Shipped", total: 1840, courier: "BlueDart", tracking: "BD7741230", items: ["Vitamin C Serum 30ml", "Ceramide Moisturiser"] },
      { no: "#11201", date: "1 month ago", status: "Delivered", total: 1290, courier: "Delhivery", tracking: "DL5510022", items: ["Gentle Foaming Cleanser"] },
      { no: "#10876", date: "3 months ago", status: "Delivered", total: 5110, courier: "BlueDart", tracking: "BD2210019", items: ["Discovery Set", "SPF 50 Sunscreen", "Lip Mask"] },
    ],
    returns: [],
  },
  sc2: {
    name: "Ananya Reddy", email: "ananya.r@outlook.com", since: "Jan 2025", ltv: 3420,
    orders: [
      { no: "#11455", date: "5 days ago", status: "Delivered", total: 2150, courier: "Delhivery", tracking: "DL5519981", items: ["Retinol Night Oil", "Ceramide Moisturiser"] },
    ],
    returns: [
      { no: "RET-2231", order: "#11455", reason: "Reaction / irritation", status: "Requested", item: "Retinol Night Oil" },
    ],
  },
  sc3: {
    name: "Meera Iyer", email: "meera.iyer@gmail.com", since: "Mar 2025", ltv: 990,
    orders: [
      { no: "#11470", date: "1 day ago", status: "Processing", total: 990, courier: null, tracking: null, items: ["Niacinamide Serum"] },
    ],
    returns: [],
  },
  sc4: {
    name: "Fatima Sheikh", email: "fatima.sheikh@gmail.com", since: "Nov 2024", ltv: 6700,
    orders: [
      { no: "#11448", date: "4 days ago", status: "Shipped", total: 3300, courier: "BlueDart", tracking: "BD7740088", items: ["Hydration Bundle", "Lip Mask"] },
    ],
    returns: [],
  },
  sc5: {
    name: "Karthik Nair", email: "karthik.n@gmail.com", since: "Feb 2025", ltv: 1650,
    orders: [
      { no: "#11460", date: "2 days ago", status: "Shipped", total: 1650, courier: "Delhivery", tracking: "DL5520140", items: ["SPF 50 Sunscreen", "Gentle Foaming Cleanser"] },
    ],
    returns: [],
  },
};

export interface Contact {
  id: string;
  name: string;
  initials: string;
  color: string;
  phone: string | null;
  email: string | null;
  handle: string | null;
  channels: ChannelId[];
  shopify: string | null;
}

export const CONTACTS: Record<string, Contact> = {
  c1: { id: "c1", name: "Priya Sharma", initials: "PS", color: "#4F46E5", phone: "+91 98200 11432", email: "priya.sharma@gmail.com", handle: null, channels: ["whatsapp", "email"], shopify: "sc1" },
  c2: { id: "c2", name: "Ananya Reddy", initials: "AR", color: "#DB2777", phone: "+91 90040 55199", email: "ananya.r@outlook.com", handle: "@ananya.r", channels: ["whatsapp", "instagram"], shopify: "sc2" },
  c3: { id: "c3", name: "Meera Iyer", initials: "MI", color: "#0891B2", phone: "+91 99860 47012", email: "meera.iyer@gmail.com", handle: null, channels: ["whatsapp"], shopify: "sc3" },
  c4: { id: "c4", name: "Fatima Sheikh", initials: "FS", color: "#7C3AED", phone: "+91 95550 70088", email: "fatima.sheikh@gmail.com", handle: null, channels: ["whatsapp"], shopify: "sc4" },
  c5: { id: "c5", name: "Karthik Nair", initials: "KN", color: "#EA580C", phone: "+91 98453 20140", email: "karthik.n@gmail.com", handle: "@karthik.shoots", channels: ["instagram", "whatsapp"], shopify: "sc5" },
  c6: { id: "c6", name: "Sana Qureshi", initials: "SQ", color: "#0EA5E9", phone: "+91 90900 31188", email: "sana.q@gmail.com", handle: null, channels: ["web"], shopify: null },
  c7: { id: "c7", name: "Neha Joshi", initials: "NJ", color: "#16A34A", phone: "+91 98330 99021", email: "neha.joshi@gmail.com", handle: null, channels: ["whatsapp"], shopify: null },
  c8: { id: "c8", name: "Aditya Rao", initials: "AR", color: "#9333EA", phone: "+91 97400 22119", email: "aditya.rao@gmail.com", handle: "@adityarao", channels: ["messenger"], shopify: null },
};

export type MessageKind = "text" | "system" | "interactive" | "image";
export type MessageDelivery = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  dir: "in" | "out" | "sys";
  kind: MessageKind;
  body: string;
  time: string;
  author?: "ai" | "me" | string;
  delivery?: MessageDelivery;
  buttons?: string[];
}

export interface ConversationSession {
  open: boolean;
  hoursLeft: number | null;
}

export interface Conversation {
  id: string;
  contactId: string;
  channel: ChannelId;
  state: ConversationState;
  assigneeId: string | null;
  lastAt: string;
  unread: boolean;
  aiUrgency: AiUrgency;
  aiCategory: string;
  sentiment: string;
  waitingFor?: string;
  session: ConversationSession;
  summary: string;
  messages: Message[];
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv1", contactId: "c2", channel: "whatsapp", state: "WAITING_AGENT",
    assigneeId: null, lastAt: "4m", unread: true, aiUrgency: "high", aiCategory: "Return / refund",
    sentiment: "Frustrated", waitingFor: "4m", session: { open: true, hoursLeft: 19 },
    summary: "Ananya wants to return the Retinol Night Oil from order #11455 — says it caused irritation. Return RET-2231 is already requested. She's asking whether she'll be refunded since the bottle is opened. AI escalated: refund-eligibility on opened skincare needs a human decision.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "Hi, the retinol oil I got is breaking me out badly 😣 I want to return it", time: "6:02 PM" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "I'm so sorry to hear that, Ananya — irritation from a new retinol can happen. I've found your order #11455 (delivered 5 days ago) and started a return request (RET-2231) for the Retinol Night Oil. 💜", time: "6:02 PM", delivery: "read" },
      { id: "m3", dir: "in", kind: "text", body: "But I already opened it and used it twice. Will I still get my money back?", time: "6:03 PM" },
      { id: "m4", dir: "sys", kind: "system", body: "Escalated to agent — low confidence on refund eligibility for an opened product", time: "6:03 PM" },
    ],
  },
  {
    id: "cv2", contactId: "c4", channel: "whatsapp", state: "WAITING_AGENT",
    assigneeId: null, lastAt: "22m", unread: true, aiUrgency: "critical", aiCategory: "Delivery issue",
    sentiment: "Angry", waitingFor: "22m", session: { open: true, hoursLeft: 7 },
    summary: "Fatima's order #11448 shows 'Shipped' via BlueDart (BD7740088) 4 days ago but tracking hasn't updated in 3 days. She's messaged twice and is upset. AI escalated: possible lost shipment, needs a human to raise a courier ticket.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "Where is my order?? It says shipped 4 days back and nothing since", time: "5:40 PM" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "I understand the worry, Fatima. Your order #11448 shipped via BlueDart on 9 June (tracking BD7740088). Let me check the latest status…", time: "5:41 PM", delivery: "read" },
      { id: "m3", dir: "in", kind: "text", body: "This is the second time I'm asking. Very disappointed.", time: "5:44 PM" },
      { id: "m4", dir: "sys", kind: "system", body: "Escalated to agent — courier tracking stale for 3 days, possible lost shipment", time: "5:44 PM" },
    ],
  },
  {
    id: "cv3", contactId: "c1", channel: "whatsapp", state: "AI_HANDLING",
    assigneeId: null, lastAt: "1m", unread: false, aiUrgency: "low", aiCategory: "Order status",
    sentiment: "Neutral", session: { open: true, hoursLeft: 23 },
    summary: "Priya is asking for the tracking number for order #11432 (shipped 3 days ago via BlueDart). The AI has the data and is answering autonomously.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "Hi! Can I get the tracking for my last order?", time: "6:05 PM" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "Of course, Priya! Your order #11432 shipped via BlueDart 3 days ago. 📦", time: "6:05 PM", delivery: "read" },
      { id: "m3", dir: "out", author: "ai", kind: "text", body: "Tracking number: BD7741230 — estimated delivery is tomorrow by 7 PM. You can track it live here: bluedart.com/track", time: "6:05 PM", delivery: "delivered" },
      { id: "m4", dir: "in", kind: "text", body: "Perfect, thank you!", time: "6:06 PM" },
      { id: "m5", dir: "out", author: "ai", kind: "interactive", body: "Happy to help! Is there anything else I can do for you?", buttons: ["Yes, one more thing", "No, all good"], time: "6:06 PM", delivery: "delivered" },
    ],
  },
  {
    id: "cv4", contactId: "c3", channel: "whatsapp", state: "AI_HANDLING",
    assigneeId: null, lastAt: "3m", unread: false, aiUrgency: "low", aiCategory: "Product question",
    sentiment: "Positive", session: { open: true, hoursLeft: 21 },
    summary: "Meera asked whether the Niacinamide Serum (order #11470, still processing) can be used with vitamin C. AI is answering from the product knowledge base.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "Can I use the niacinamide serum together with vitamin C?", time: "6:01 PM" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "Great question, Meera! Yes — niacinamide and vitamin C work well together and the old 'don't mix them' advice is a myth. 🙂 Use vitamin C in the morning and you can layer niacinamide after. Your Niacinamide Serum (#11470) is being packed now and ships within 24h.", time: "6:02 PM", delivery: "read" },
    ],
  },
  {
    id: "cv5", contactId: "c5", channel: "instagram", state: "AI_HANDLING",
    assigneeId: null, lastAt: "8m", unread: false, aiUrgency: "medium", aiCategory: "Address change",
    sentiment: "Neutral", session: { open: true, hoursLeft: null },
    summary: "Karthik wants to change the delivery address on order #11460 (shipped 2 days ago). AI flagged that it's already shipped and is confirming whether redirection is possible.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "I need to change my delivery address, I moved last week", time: "5:55 PM" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "Let me check that for you, Karthik. Your order #11460 has already shipped via Delhivery (2 days ago), so I'll need to request an address redirection with the courier — this works in ~70% of cases. Can you share the new full address with pincode?", time: "5:55 PM", delivery: "read" },
    ],
  },
  {
    id: "cv6", contactId: "c1", channel: "web", state: "ASSIGNED",
    assigneeId: "me", lastAt: "34m", unread: false, aiUrgency: "medium", aiCategory: "Wholesale enquiry",
    sentiment: "Positive", session: { open: true, hoursLeft: null },
    summary: "Priya (a returning customer) is asking about bulk/wholesale pricing for a salon. AI handed off because pricing negotiation is a human task. Assigned to you.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "Hi, I run a small salon in Pune and I'd love to stock your sunscreen. Do you offer wholesale rates?", time: "5:30 PM" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "How lovely! Wholesale is handled by our partnerships team — let me bring in a human colleague who can share pricing and minimums with you. One moment 💜", time: "5:30 PM", delivery: "read" },
      { id: "m3", dir: "sys", kind: "system", body: "Assigned to Aisha Khan", time: "5:31 PM" },
      { id: "m4", dir: "out", author: "me", kind: "text", body: "Hi Priya, Aisha here! Lovely that you'd like to stock Bloom & Bare. For salons we start at 30% off MRP with a minimum order of ₹15,000. Shall I email you the full wholesale catalogue?", time: "5:36 PM", delivery: "read" },
    ],
  },
  {
    id: "cv7", contactId: "c7", channel: "whatsapp", state: "WAITING_AGENT",
    assigneeId: null, lastAt: "1h", unread: false, aiUrgency: "medium", aiCategory: "Order not received",
    sentiment: "Neutral", waitingFor: "1h 04m", session: { open: false, hoursLeft: 0 },
    summary: "Neha says she never received an order but the AI couldn't find any order under her phone number or email — she may have used a different number at checkout. Needs a human to match her to a Shopify order. WhatsApp 24h window has expired.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "I ordered last week and nothing has come. Order under Neha Joshi.", time: "Yesterday" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "I'd love to help track that down, Neha. I'm not finding an order under this number — could the order have used a different phone or email at checkout?", time: "Yesterday", delivery: "read" },
      { id: "m3", dir: "sys", kind: "system", body: "Escalated to agent — couldn't match contact to a Shopify order", time: "Yesterday" },
    ],
  },
  {
    id: "cv8", contactId: "c8", channel: "messenger", state: "RESOLVED",
    assigneeId: "a2", lastAt: "2h", unread: false, aiUrgency: "low", aiCategory: "Product question",
    sentiment: "Positive", session: { open: true, hoursLeft: null },
    summary: "Aditya asked whether the SPF 50 sunscreen leaves a white cast. AI answered from the product KB and he was satisfied. Resolved.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "Does your spf 50 leave a white cast? I have medium-deep skin", time: "4:10 PM" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "Good question! Our SPF 50 is a chemical sunscreen with no zinc/titanium, so it blends clear with no white cast on medium-deep skin. 🙌", time: "4:10 PM", delivery: "read" },
      { id: "m3", dir: "in", kind: "text", body: "Amazing, ordering now 🙏", time: "4:12 PM" },
      { id: "m4", dir: "sys", kind: "system", body: "Marked resolved by Rohan Mehta", time: "4:13 PM" },
    ],
  },
  {
    id: "cv9", contactId: "c6", channel: "web", state: "AI_HANDLING",
    assigneeId: null, lastAt: "12m", unread: false, aiUrgency: "low", aiCategory: "Pre-sales",
    sentiment: "Neutral", session: { open: true, hoursLeft: null },
    summary: "Sana (not yet a customer) is asking for a routine recommendation for oily, acne-prone skin. AI is guiding her to the right products.",
    messages: [
      { id: "m1", dir: "in", kind: "text", body: "hi, what do you recommend for oily acne prone skin?", time: "5:51 PM" },
      { id: "m2", dir: "out", author: "ai", kind: "text", body: "Hi Sana! For oily, acne-prone skin I'd suggest our Gentle Foaming Cleanser, the Niacinamide Serum (helps with oil + marks), and the SPF 50 (oil-free). Want me to put together a starter routine with prices?", time: "5:51 PM", delivery: "read" },
    ],
  },
];

export interface StateMeta {
  label: string;
  tone: "amber" | "violet" | "slate" | "green";
  color: string;
}

export const STATE_META: Record<ConversationState, StateMeta> = {
  WAITING_AGENT: { label: "Waiting", tone: "amber", color: "#F59E0B" },
  AI_HANDLING: { label: "AI handling", tone: "violet", color: "#8B5CF6" },
  ASSIGNED: { label: "Assigned", tone: "slate", color: "#64748B" },
  RESOLVED: { label: "Resolved", tone: "green", color: "#10B981" },
};

export const URGENCY_COLOR: Record<AiUrgency, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

export type TemplateLanguage = "English" | "Hindi" | "Tamil" | "Arabic";
export type TemplateCategory = "Utility" | "Marketing" | "Authentication";
export type TemplateStatusValue = "Approved" | "Pending review" | "Draft" | "Rejected";

export interface TemplateRecord {
  id: string;
  name: string;
  lang: TemplateLanguage;
  category: TemplateCategory;
  status: TemplateStatusValue;
  updated: string;
  body: string;
  vars: string[];
}

export const TEMPLATES: TemplateRecord[] = [
  { id: "t1", name: "order_shipped", lang: "English", category: "Utility", status: "Approved", updated: "2 days ago",
    body: "Hi {{1}}! Good news — your Bloom & Bare order {{2}} has shipped via {{3}}. Track it here: {{4}}",
    vars: ["Priya", "#11432", "BlueDart", "bluedart.com/track"] },
  { id: "t2", name: "return_approved", lang: "English", category: "Utility", status: "Approved", updated: "5 days ago",
    body: "Hi {{1}}, your return {{2}} has been approved. A pickup will be arranged within 2 business days. 💜",
    vars: ["Ananya", "RET-2231"] },
  { id: "t3", name: "abandoned_cart_offer", lang: "English", category: "Marketing", status: "Pending review", updated: "1 day ago",
    body: "Hi {{1}}, you left some goodies in your cart! Here's 10% off to complete your order: {{2}}",
    vars: ["there", "BLOOM10"] },
  { id: "t4", name: "cod_confirmation", lang: "Hindi", category: "Utility", status: "Approved", updated: "1 week ago",
    body: "नमस्ते {{1}}! आपका ऑर्डर {{2}} (कैश ऑन डिलीवरी) कन्फर्म हो गया है। राशि: ₹{{3}}",
    vars: ["प्रिया", "#11432", "1840"] },
  { id: "t5", name: "feedback_request", lang: "English", category: "Marketing", status: "Rejected", updated: "1 week ago",
    body: "Hi {{1}}, how are you liking your {{2}}? Reply with a ⭐ rating 1–5!",
    vars: ["Priya", "Vitamin C Serum"] },
  { id: "t6", name: "otp_verification", lang: "English", category: "Authentication", status: "Approved", updated: "2 weeks ago",
    body: "{{1}} is your Bloom & Bare verification code. It expires in 10 minutes.",
    vars: ["492013"] },
];

export interface ChannelStatusRow {
  id: ChannelId;
  status: "Active" | "Not connected";
  display: string | null;
  activity: string | null;
  today: number;
  recommended?: boolean;
}

export const CHANNEL_STATUS: ChannelStatusRow[] = [
  { id: "whatsapp", status: "Active", display: "Bloom & Bare — +91 80000 12345", activity: "2m ago", today: 142, recommended: true },
  { id: "instagram", status: "Active", display: "@bloomandbare", activity: "8m ago", today: 37 },
  { id: "web", status: "Active", display: "bloomandbare.in", activity: "12m ago", today: 24 },
  { id: "messenger", status: "Active", display: "Bloom & Bare", activity: "2h ago", today: 9 },
  { id: "email", status: "Not connected", display: null, activity: null, today: 0 },
  { id: "sms", status: "Not connected", display: null, activity: null, today: 0 },
];

export const AI_SUGGESTIONS: Record<string, { confidence: number; text: string }> = {
  cv1: { confidence: 74, text: "I completely understand, Ananya. Since the retinol caused a reaction, you're covered by our skin-safety guarantee — even though it's opened. I've approved a full refund of ₹1,090 for the Retinol Night Oil, which you'll receive in 3–5 days. A free pickup will be arranged. 💜" },
  cv2: { confidence: 61, text: "Fatima, I'm really sorry — you're right to chase this. I've checked BlueDart and the parcel hasn't moved since 10 June, so I've raised a priority trace (ref BD-INV-7740088) and flagged it as possibly lost. If it doesn't update in 24h I'll ship a free replacement of #11448 today. I'll personally keep you posted." },
  cv7: { confidence: 68, text: "Thanks for your patience, Neha. I found an order under a different number ending 4471 — order #11399, shipped to a Bandra address. Is that yours? If so, it shows 'Delivered' on 8 June — I can open a 'not received' investigation with the courier right away." },
};

export function renderTemplate(t: TemplateRecord): string {
  return t.vars.reduce(
    (body, v, i) => body.replaceAll(`{{${i + 1}}}`, v),
    t.body,
  );
}

export function contactById(id: string): Contact | undefined {
  return CONTACTS[id];
}
export function agentById(id: string): AgentMeta | undefined {
  return AGENTS.find((a) => a.id === id);
}
export function shopifyByContact(contactId: string): ShopifyCustomer | null {
  const c = CONTACTS[contactId];
  return c && c.shopify ? SHOPIFY[c.shopify] ?? null : null;
}
export function conversationById(id: string): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.id === id);
}

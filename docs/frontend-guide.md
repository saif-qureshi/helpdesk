# Claude Code — Build UI on Existing Next.js + Clerk Setup

---

## Current project state

The project is already set up. Do NOT re-scaffold, re-init, or change any existing configuration. Here is what already exists:

- ✅ Next.js 14 with App Router and TypeScript (`strict: true`)
- ✅ Tailwind CSS configured
- ✅ Clerk auth installed and working — `middleware.ts`, `ClerkProvider` in root layout, sign-in/sign-up routes exist
- ✅ Basic folder structure in place

What does NOT exist yet:

- ❌ shadcn/ui (needs installing)
- ❌ Any product UI (no ticket screens, no dashboard, nothing)
- ❌ Dummy data or types
- ❌ Component library

---

## Your first task — audit the existing project

Before writing a single line of code, do the following:

1. Read `package.json` and list every installed dependency
2. Read `middleware.ts` and tell me exactly which routes are protected by Clerk and which are public
3. Read `app/layout.tsx` and note how ClerkProvider is set up
4. List every file and folder currently in `src/` (or root if no src dir)
5. Check if `tailwind.config.ts` has any custom colours or theme extensions already defined

Report what you find, then wait for my confirmation before proceeding. I may need to correct something before you build on top of it.

---

## Step 1 — Install shadcn/ui on the existing project

After auditing, run:

```bash
npx shadcn@latest init
```

When prompted:

- Style: Default
- Base colour: Slate
- CSS variables: Yes

Then add all components needed for the helpdesk UI in one command:

```bash
npx shadcn@latest add button badge avatar dropdown-menu dialog sheet tabs table tooltip command input textarea select separator skeleton scroll-area
npx shadcn@latest add chart
npm install lucide-react
```

After installing, confirm `components/ui/` exists and contains the installed components before moving on.

---

## Step 2 — Add Inter font

In the existing `app/layout.tsx`, add Inter via `next/font/google`. Do not remove or break the existing `ClerkProvider` wrapping. The result should look like:

```tsx
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.className}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

Preserve any other providers or metadata already in the file.

---

## Step 3 — Create types and dummy data

Create these two files before any components:

### `src/types/index.ts`

```typescript
export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "urgent" | "high" | "medium" | "low";
export type TicketChannel = "email" | "widget" | "api";
export type SentimentType = "satisfied" | "neutral" | "frustrated";
export type MessageType = "customer" | "agent" | "ai" | "system";

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "agent" | "admin";
  isOnline: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: "starter" | "growth" | "enterprise";
  totalTickets: number;
  joinedAt: string;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  authorName: string;
  createdAt: string;
  isInternal?: boolean;
  isAiGenerated?: boolean;
  reviewedBy?: string;
}

export interface Ticket {
  id: string;
  number: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  category: string;
  customer: Customer;
  assignedAgent?: Agent;
  messages: Message[];
  aiSummary?: string;
  aiSentiment?: SentimentType;
  aiSentimentConfidence?: number;
  aiSuggestedArticles?: { id: string; title: string }[];
  slaDeadline: string;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface AgentPerformance {
  agent: Agent;
  ticketsResolved: number;
  avgResponseTime: string;
  csat: number;
  aiDraftAcceptRate: number;
}
```

### `src/lib/dummy-data.ts`

Generate realistic dummy data — not Lorem ipsum. Use real-looking names, real company names, real-sounding ticket subjects. Include:

- 15 tickets with a mix of statuses (open, pending, resolved), priorities, categories, and SLA states (some breached, some healthy)
- 5 agents (e.g. Sarah Chen, Marcus Webb, Priya Nair, James Okafor, Lisa Park)
- 8 customers with real company names and different plan tiers
- 3–5 messages per ticket (mix of customer, agent, and AI message types)
- Ticket categories: `['Billing', 'Bug Report', 'Feature Request', 'Account Access', 'Integration Help', 'General']`
- 30-day analytics dataset: array of `{ date: string, total: number, aiResolved: number }`
- Agent performance data for the analytics table

---

## Step 4 — Build shared components first

Create `src/components/shared/` with these reusable primitives. Every other component depends on them.

### `ai-badge.tsx`

Purple badge with `Sparkles` Lucide icon. Used on anything AI-generated.

```tsx
// Usage: <AiBadge /> or <AiBadge label="AI Summary" />
```

Colours: `bg-purple-50 text-purple-700 border border-purple-200`

### `priority-dot.tsx`

Small coloured circle indicating priority.

- urgent → `bg-red-500`
- high → `bg-amber-500`
- medium → `bg-green-500`
- low → `bg-gray-400`

### `status-badge.tsx`

Pill badge with coloured dot prefix.

- open → blue
- pending → amber
- resolved → green
- closed → gray

### `sla-indicator.tsx`

- Green checkmark if SLA healthy (>2h remaining)
- Amber clock icon if <2h remaining
- Red flame icon if breached
  Accepts `deadline: string` and `breached: boolean` props. Calculates time remaining internally.

### `empty-state.tsx`

Accepts: `icon: LucideIcon`, `title: string`, `description: string`, `ctaLabel?: string`, `onCta?: () => void`

### `agent-avatar.tsx`

Avatar with small green online dot if `isOnline`. Falls back to initials if no `avatarUrl`.

---

## Step 5 — Dashboard layout

Create the persistent shell that wraps all dashboard pages.

### `src/components/layout/sidebar.tsx`

Left sidebar, fixed, 240px wide. Contains:

- Top: workspace name (hardcoded "Acme Support" for now — will come from Clerk org later)
- Nav items with Lucide icons:
  - Tickets → `/tickets` (Inbox icon)
  - Analytics → `/analytics` (BarChart2 icon)
  - Knowledge Base → `/knowledge` (BookOpen icon) — placeholder, links to `/tickets` for now
  - Settings → `/settings/ai-triage` (Settings icon)
- Active state: `bg-indigo-50 text-indigo-700 font-medium`
- Inactive state: `text-gray-600 hover:bg-gray-100`
- Bottom: Clerk `<UserButton />` with agent name beside it

At 768px: collapse to icon-only (hide text labels, keep icons centred, 64px wide).

### `src/components/layout/topbar.tsx`

Top bar for dashboard. Contains:

- Page title (passed as prop)
- Global search input (uses shadcn `Command` component, `⌘K` shortcut hint)
- Notification bell icon (static for now)
- Clerk `<UserButton />` (small, top right)

### `src/app/(dashboard)/layout.tsx`

Combine sidebar + topbar. Apply to all dashboard routes. This route group must be protected by Clerk — check `middleware.ts` to confirm it already is, and note it in your response.

```tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

## Step 6 — Build each screen

Build screens in this order. For each screen, break the code into sub-components as specified — do not put everything in the page file.

---

### Screen A — Ticket Queue `/tickets`

**Page file:** `src/app/(dashboard)/tickets/page.tsx`

**Sub-components to create in `src/components/tickets/`:**

`ticket-row.tsx` — single row in the list. Props: `ticket: Ticket`, `isSelected: boolean`, `onClick: () => void`. Shows:

- Priority dot
- Ticket number (#1042)
- Customer name + company (smaller, gray)
- Subject (truncated, one line)
- AI category badge (purple)
- Status badge
- Assigned agent avatar
- "2h ago" relative time
- SLA indicator
- Hover: `bg-gray-50`. Selected: `bg-indigo-50` with `border-l-2 border-indigo-600`

`ticket-list.tsx` — renders the list. Accepts `tickets: Ticket[]`. Shows skeleton loaders for 1s on mount, then renders rows.

`ticket-filters.tsx` — tabs (My Queue / All / Unassigned) + filter chips for Status and Priority. Filters applied to dummy data in local state.

`ticket-preview.tsx` — right panel quick preview. Shows when a ticket row is clicked. Contains:

- Customer name, company, plan badge, email
- AI summary card (purple-tinted `bg-purple-50`, `AiBadge`, 2-3 sentence summary)
- Last 2 messages condensed
- Action buttons: "Open full ticket" (links to `/tickets/[id]`), "Assign to me", status dropdown

**Page layout:** Two columns. Left 60% = filters + list. Right 40% = preview panel (hidden on mobile).

**Local state in page:**

- `selectedTicketId: string | null`
- `activeTab: 'mine' | 'all' | 'unassigned'`
- `statusFilter: TicketStatus | 'all'`

---

### Screen B — Ticket Detail `/tickets/[id]`

**Page file:** `src/app/(dashboard)/tickets/[id]/page.tsx`

Read the `id` param, find the ticket in dummy data. If not found, show a not-found state.

**Sub-components:**

`conversation-thread.tsx` — renders messages in order.

- Customer messages: left-aligned, `bg-gray-100` bubble, customer avatar/initials
- Agent messages: right-aligned, `bg-indigo-50` bubble
- AI messages: right-aligned, `bg-purple-50` bubble, `Sparkles` icon avatar, `AiBadge` label, "reviewed by [agent]" note
- System events (status changed, assigned): centred, small gray text, no bubble

`reply-composer.tsx` — bottom composer. Contains:

- Toggle: "Reply" / "Internal Note" — note mode adds `bg-yellow-50` tint and a "🔒 Internal note" label
- Basic toolbar: Bold (B), Italic (I), Link, BulletList icons (visual only at this stage)
- Textarea for reply content
- "Generate AI draft" button — purple, `Sparkles` icon. On click:
  1. Show loading spinner for 1500ms
  2. Then simulate streaming: render a pre-written dummy reply into the textarea character by character using `setInterval` at 18ms per character
  3. Show "Accept / Discard" buttons below textarea while streaming or after
  4. Accept: keep the text, hide buttons. Discard: clear textarea, hide buttons.
- "Send" button — primary indigo. On click: append new message to thread in local state, clear textarea.

`ai-insights-panel.tsx` — right sidebar. Shows:

- Customer card with plan badge and total tickets
- AI insights card (`border border-purple-200 bg-purple-50`):
  - Sentiment with emoji + confidence % + `AiBadge`
  - Predicted resolution category
  - Suggested KB articles (2–3 dummy links)
- Ticket metadata: created date, channel, SLA deadline countdown, tags (render as chips)
- Assignment: agent dropdown (list of dummy agents), team label

**Page layout:** Three columns at 1280px. At 768px: hide right sidebar, show as Sheet (drawer) via a "View details" button.

---

### Screen C — AI Triage Settings `/settings/ai-triage`

**Page file:** `src/app/(dashboard)/settings/ai-triage/page.tsx`

Single scrollable column, max-width 720px, no sub-components needed — self-contained settings page.

Sections (all local state, no API):

1. **Auto-classification toggle** — `Switch` component. Below: table of categories with columns: Name, Default Priority, Assigned Team. Add/remove row buttons (add pushes a new editable row, remove deletes it from local state).
2. **Auto-response rules** — toggle + confidence threshold slider (range input, 0–100, default 85). Show label: "AI will auto-send when confidence ≥ {value}%".
3. **Reply tone** — radio group: Professional / Friendly / Concise. Show a dummy preview sentence below that changes per selection.
4. **Escalation triggers** — checklist of 4 conditions (see UI prompt for list).
5. **AI persona instructions** — large `Textarea`, 8 rows, with character count below. Pre-fill with realistic example instructions.
6. Sticky "Save changes" button at bottom (shows a success toast on click using shadcn `toast`).

---

### Screen D — Analytics `/analytics`

**Page file:** `src/app/(dashboard)/analytics/page.tsx`

Sub-components in `src/components/analytics/`:

`kpi-card.tsx` — card with label, large value, % change with up/down arrow coloured green/red.

`ticket-volume-chart.tsx` — Recharts `LineChart` via shadcn chart wrapper. Two lines: total tickets (indigo) vs AI resolved (purple). X-axis: date labels. Load data from dummy-data.ts.

`category-chart.tsx` — Recharts `PieChart` (donut style). Categories with legend.

`agent-table.tsx` — shadcn `Table`. Columns: Agent (avatar + name), Resolved, Avg Response, CSAT (star rating display), AI Accept Rate (progress bar), Online dot.

**Page layout:**

- Date range tabs: 7d / 30d / 90d — slices the dummy analytics array
- Row 1: 4 KPI cards in a grid
- Row 2: volume chart (60%) + category chart (40%)
- Row 3: agent table full width

---

### Screen E — Onboarding `/onboarding`

**Page file:** `src/app/(onboarding)/onboarding/page.tsx`

This route should be PUBLIC (not behind Clerk dashboard auth) — check middleware and ensure `/onboarding` is in the public routes list. If it is not, add it.

Self-contained 3-step wizard. Local state: `currentStep: 1 | 2 | 3`.

Outer shell: full-page gray-50 background, centred white card, max-width 480px, progress bar at top (33% / 66% / 100%).

Step 1 — workspace setup form: workspace name input, industry select, team size radio group. "Continue" button validates that workspace name is not empty.

Step 2 — email connection: two large selectable cards (Gmail, Outlook) with icons. Only one selectable at a time. "Skip for now" text link. "Continue" button.

Step 3 — invite team: email chip input (pressing Enter adds email as a removable chip tag), role selector (Agent/Admin) per chip. "Send invites & finish" button navigates to `/tickets`.

---

### Screen F — Chat Widget `/widget`

**Page file:** `src/app/widget/page.tsx` — PUBLIC route.

This is a demo/preview page showing the widget in both states side by side on a mock "client website" background.

`src/components/widget/chat-bubble.tsx` — collapsed state. Fixed bottom-right. Indigo circle, `MessageCircle` icon. Notification dot if there's an active thread.

`src/components/widget/chat-panel.tsx` — expanded state. 380px × 560px. Drop shadow, 16px border radius. Contains:

- Header: company logo placeholder, "Typically replies in minutes", close `X` button
- If no conversation: welcome message + 3 quick action buttons ("Track my order", "Billing question", "Report a bug") + text input
- If conversation started: message thread + typing indicator animation (3 bouncing dots) + input bar
- Simulate AI response: when user sends a message, show typing indicator for 1500ms, then render a dummy AI reply

Local state on widget page: `isExpanded: boolean`, `hasConversation: boolean`.

---

## Step 7 — Final checks

After all screens are built, run these and fix any errors before considering this milestone done:

```bash
npx tsc --noEmit          # Must pass with zero errors
npm run build             # Must complete successfully
```

Then verify manually:

- [ ] Clerk auth still works — sign in redirects to `/tickets`
- [ ] Sidebar navigation works between all pages
- [ ] Ticket row click shows preview panel
- [ ] "Open full ticket" navigates to `/tickets/[id]`
- [ ] AI draft simulation streams in ticket detail
- [ ] Onboarding step navigation works
- [ ] All pages render without console errors
- [ ] Sidebar collapses to icons at 768px

---

## Rules to follow throughout

1. **Do not touch `middleware.ts`** except to add `/onboarding` and `/widget` to public routes if they are not already there
2. **Do not remove or modify ClerkProvider** — build around it
3. **No inline styles** — Tailwind classes only
4. **No `any` types** — use the types from `src/types/index.ts`
5. **All AI content** uses purple accent (`purple-50`, `purple-700`, `purple-200`) and `Sparkles` Lucide icon — consistently, everywhere
6. **Import dummy data** from `src/lib/dummy-data.ts` — never hardcode data inside components
7. **Ask before installing** any npm package not listed in this prompt

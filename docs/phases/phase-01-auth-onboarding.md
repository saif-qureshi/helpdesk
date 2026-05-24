# Phase 1 — Multi-tenant auth & organisation onboarding

## Goal
A new user signs up via Clerk, is forced through an onboarding flow that creates an `Organisation`, can invite teammates with roles, and lands on an empty dashboard scoped to their org.

## User stories
- As a new user, I can sign up with email or Google.
- As a new user, I am redirected to `/onboarding` if I don't belong to an org.
- As a workspace owner, I can name my organisation and pick a subdomain-like slug.
- As an owner/admin, I can invite teammates by email and assign a role (`OWNER`, `ADMIN`, `AGENT`, `VIEWER`).
- As an invited user, I receive a Clerk email, accept, and land on the same org's dashboard.
- As any authed user, every page I see is scoped to my currently selected organisation.

## Technical tasks
1. Install Clerk: `@clerk/nextjs`. Wrap `app/layout.tsx` in `<ClerkProvider>`.
2. Enable Clerk **Organizations** in the dashboard. Set required org for app routes.
3. Create `middleware.ts` using `clerkMiddleware()` with public routes `["/", "/sign-in(.*)", "/sign-up(.*)", "/api/widget/(.*)", "/api/webhooks/(.*)", "/api/health"]`.
4. Add `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `app/(auth)/sign-up/[[...sign-up]]/page.tsx` using Clerk components.
5. Create `app/onboarding/page.tsx`: a single form (org name + slug) that calls `POST /api/onboarding` which uses Clerk's `clerkClient.organizations.createOrganization` then mirrors into our `Organisation` table.
6. Create `lib/auth/tenant.ts` exporting `requireOrg()` (returns `{ userId, orgId, role }` or throws) and `getOrgId()` (nullable). Use in every server component and route handler.
7. Create **Prisma middleware** in `lib/db.ts` that, for every query on models implementing `organisationId`, throws if the query lacks an `organisationId` where-clause. This is the global tenancy guard.
8. Add Clerk webhook handler at `app/api/webhooks/clerk/route.ts` verifying with `svix`. Handle `organization.created`, `organization.updated`, `organization.deleted`, `organizationMembership.created/updated/deleted` to sync `Organisation` and `Member` rows.
9. Build dashboard shell `app/(dashboard)/layout.tsx`: left sidebar (Tickets, Knowledge, Analytics, Settings), top bar (org switcher = `<OrganizationSwitcher>`, user button).
10. Add `app/(dashboard)/page.tsx` — empty-state dashboard (welcome card, "Create your first ticket" CTA placeholder).
11. Add `app/(dashboard)/settings/team/page.tsx` showing the member list using `clerkClient.organizations.getOrganizationMembershipList`, with an "Invite" dialog calling `createOrganizationInvitation`.
12. Add a server-side role guard helper `requireRole("ADMIN" | "OWNER")` used by `/settings/*` pages.
13. Add a Vitest unit test for the Prisma tenancy middleware: a query without `organisationId` throws; a query with `organisationId` passes through.
14. Add a Playwright (or `@clerk/testing`) integration test: sign up → onboarding → dashboard.

## Database schema changes
```prisma
model Organisation {
  id           String   @id @default(cuid())
  clerkOrgId   String   @unique
  name         String
  slug         String   @unique
  createdAt    DateTime @default(now())
  members      Member[]
}

model Member {
  id             String   @id @default(cuid())
  clerkUserId    String
  organisationId String
  role           Role
  email          String
  name           String?
  createdAt      DateTime @default(now())
  organisation   Organisation @relation(fields: [organisationId], references: [id], onDelete: Cascade)

  @@unique([clerkUserId, organisationId])
  @@index([organisationId])
}

enum Role {
  OWNER
  ADMIN
  AGENT
  VIEWER
}
```

## AI integration points
- None.

## Environment variables needed
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## Definition of done
- [ ] New user can sign up, onboard, and reach `/` with their org selected.
- [ ] Invited user accepts, lands on the inviting org's dashboard.
- [ ] Clerk webhook keeps `Organisation` + `Member` in sync (verified by deleting an org in Clerk and observing the row disappear).
- [ ] Tenancy middleware test passes; a deliberately wrong query in dev throws a loud error.
- [ ] Roles enforced: a `VIEWER` cannot open `/settings/team` (server-side 403).

## Estimated effort
**4 days**

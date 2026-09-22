# Passage — Global Scholarship & University Application Platform

> Your journey to global education, organized.

Passage is a Next.js + Supabase application that helps students discover
scholarships, university programs, fellowships and research opportunities,
check their eligibility, and manage every application — official
requirements, tasks they add themselves, documents, and deadlines — from
one place. It also doubles as lightweight **planning software**: a place
to state what you're preparing for (target degree, intake, countries,
funding, and notes in your own words) even before you've picked a specific
opportunity.

This is a **real, deployable app**, not a mockup — auth, the database, row
-level security, the application workspace, the document vault, the
calendar, the admin dashboard, and analytics all function end to end
against a real Supabase project once you follow the setup steps below.

---

## Table of contents

1. [What's built](#1-whats-built)
2. [Tech stack](#2-tech-stack)
3. [Setup](#3-setup)
4. [Deployment](#4-deployment)
5. [Project structure](#5-project-structure)
6. [Admin dashboard](#6-admin-dashboard)
7. [Analytics](#7-analytics)
8. [Document vault](#8-document-vault)
9. [Calendar and notifications](#9-calendar-and-notifications)
10. [Application comparison](#10-application-comparison)
11. [Automated staleness flagging](#11-automated-staleness-flagging)
12. [Planning](#12-planning)
13. [AI tools](#13-ai-tools-coming-soon)
14. [Testing](#14-testing)
15. [Design notes](#15-design-notes)
16. [Roadmap](#16-roadmap)
17. [Known limitations](#17-known-limitations)

---

## 1. What's built

### Core application
- Landing page with an animated hero (GSAP route-map illustration, scroll
  reveals), fully responsive
- Email/password auth (Supabase Auth) — signup, login, logout
- Progressive onboarding (target degree, countries, funding preference —
  all skippable)
- Dashboard — upcoming deadlines, application list, plan summary, saved
  count, AI-tools teaser, empty states
- Opportunity explorer — search + filter by country / degree / funding /
  type, with **filter options derived dynamically from the actual
  catalog** (not hardcoded)
- Opportunity detail page — funding breakdown, eligibility summary, a
  client-side "Check my eligibility" comparison against the user's profile
  (explicitly labeled as a profile match, not an official decision),
  official source + last-verified date, glossary tooltips on jargon,
  save/bookmark with tags, a "Report an issue" flow, and a persistent
  reminder to verify on the official site
- **Application workspace** (the core feature): per-application
  requirements checklist that merges platform-defined requirements with
  **user-added requirements** (spec section 13), a tasks list, an
  animated readiness ring, status tracking (interested → submitted →
  decision), and an auto-logged timeline
- CGPA calculator with grade projection
- Mobile bottom navigation, GSAP scroll/entrance animations throughout,
  `prefers-reduced-motion` respected everywhere motion is used

### Catalog and admin
- **Five real, sourced scholarships** seeded (Chevening, Commonwealth
  PhD, DAAD EPOS, Erasmus Mundus Joint Masters, Mastercard Foundation
  Scholars @ Cambridge), each with a real official source link and
  `last_verified_at` date
- **Admin dashboard** (`/admin`) — add, edit, and archive opportunities
  through a real UI, catalog health warnings, a user-report queue, a
  one-click staleness check, and a link into analytics
- **User reporting** — anyone signed in can flag a listing as having an
  incorrect deadline, broken link, outdated requirement, etc.

### Analytics
- **Admin analytics dashboard** (`/admin/analytics`) — user/signup
  counts, application counts, an events-over-time chart, an events-by-
  type breakdown, most-viewed opportunities, most-clicked official links,
  and applications-by-status, computed server-side via one Postgres
  function
- Event tracking (page views, opportunity views, outbound official-link
  clicks, track actions, searches, signups, logins) — fire-and-forget,
  admin-only to read

### Document vault, calendar, comparison
- **Document vault** (`/documents`) — upload once, attach to multiple
  applications without duplicating the file. Every upload keeps its
  previous versions (nothing is silently overwritten); you choose which
  version is "current." Files live in a private Supabase Storage bucket,
  gated by the same per-user ownership rule as everything else.
- **Calendar** (`/calendar`) — agenda and month-grid views aggregating
  every application deadline and every task with a due date, across all
  tracked applications
- **Live deadline alerts** — a notification bell (desktop sidebar and
  mobile header) computed in real time from actual deadlines/tasks due
  within 14 days — not a stored notification queue with no delivery
  behind it
- **Application comparison** (`/applications/compare`) — pick two or more
  tracked applications and see funding, deadlines, requirements-relevant
  facts, and your own status side by side
- **Saved opportunities** (`/saved`) — bookmark with dream/reach/target/
  backup tags, independent of starting a full application
- **Country directory** (`/countries`) — opportunities grouped by
  country, generated entirely from the live catalog rather than
  hand-written guide content (see §15 for why)

### Automation
- **Staleness flagging** — a `flag_stale_opportunities()` Postgres
  function downgrades an opportunity's trust level once it hasn't been
  verified in 60+ days. Runnable manually (a button in `/admin`) and,
  where your Supabase plan supports `pg_cron`, on an automatic daily
  schedule (see §11)

### Planning and AI
- **Planning page** (`/planning`) — a standing plan separate from any one
  application: target degree, target intake (free text), countries of
  interest, funding preference, and open notes, surfaced as a summary
  card on the dashboard
- **AI tools page** (`/ai`) — a "coming soon, premium" preview of planned
  AI features, explicitly scoped so future-you doesn't accidentally ship
  an assistant that invents deadlines or eligibility rules. No AI API
  calls exist anywhere in this codebase yet — this is UI-only.

### Testing
- Vitest set up with 23 passing unit tests covering the two areas with
  genuine correctness risk: deadline-phase math (`lib/deadlines.ts`) and
  the eligibility checker's core safety guarantee (never asserting a user
  "meets" a requirement it can't actually verify — see §14)

**What's still out of scope**, on purpose (see [§16, Roadmap](#16-roadmap)):
a full editorial university/program explorer with independently-authored
content, university-submitted opportunities, payments/subscriptions, and
the real AI assistant behind `/ai`.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-variable design tokens, no external UI kit) |
| Animation | GSAP (+ ScrollTrigger) |
| Charts | Original lightweight SVG/CSS charts (no charting library) |
| Auth + DB + Storage | Supabase (Postgres, Auth, Row Level Security, Storage) |
| Testing | Vitest + Testing Library |
| Icons | lucide-react |
| Fonts | System font stacks only — no external font requests |

No other runtime dependencies.

---

## 3. Setup

### 3.1 Prerequisites
- Node.js 20+
- A free [Supabase](https://supabase.com) project

### 3.2 Install

```bash
npm install
```

### 3.3 Configure Supabase

**Fresh project (recommended):**

1. Create a new project at [supabase.com](https://supabase.com).
2. In the Supabase SQL editor, run these files **in order**:
   - `supabase/schema.sql` — tables, enums, RLS policies, Storage bucket,
     and all RPC functions (`start_application`,
     `admin_analytics_summary`, `flag_stale_opportunities`)
   - `supabase/seed.sql` — the five sample scholarships
3. Make yourself an admin so you can reach `/admin`:
   ```sql
   update public.profiles set is_admin = true
   where email = 'your-email@example.com';
   ```
   (Sign up in the app first so the profile row exists, then run this.)

**Existing deployment, upgrading in stages:** run whichever migrations in
`supabase/migrations/` you haven't applied yet, **in numeric order**:

- `002_phase2_admin_and_reports.sql` — admin flag, reports, analytics
- `003_phase3_document_vault.sql` — document vault tables, Storage
  bucket, staleness-flagging function

Each migration file has a comment at the top confirming what it assumes
is already in place.

4. In your Supabase project settings → API, copy the **Project URL** and
   **anon public key**.
5. Copy the env template and fill it in:

   ```bash
   cp .env.local.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   The anon key is safe to expose client-side — Row Level Security is what
   actually protects data. Never commit `.env.local` (already
   git-ignored). **Note:** `next build` prerenders some pages and will
   fail if these env vars are entirely absent — always have a `.env.local`
   present (even with placeholder values) before building.

### 3.4 Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`. Sign up, complete or skip onboarding, and
explore the seeded opportunities. If you made yourself an admin, you'll
see an **Admin** link in the desktop sidebar.

### 3.5 Verify before deploying

```bash
npm run lint              # 0 problems
npx tsc --noEmit           # 0 errors
npm test                   # 23/23 passing
npm run check-types-sync   # confirms lib/types/database.ts matches schema.sql
npm run build               # clean production build, 22 routes
```

All five currently pass clean on this codebase.

---

## 4. Deployment

Deploys as-is to **Vercel** (recommended, zero config) or any Node host
that supports Next.js 16.

### Vercel
1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel.
3. Add environment variables in the Vercel project settings (Production,
   Preview, and Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` — your real production domain (e.g.
     `https://passage.example.com`), used by `app/sitemap.ts`
4. Deploy.

### Other hosts
- Build: `npm run build` · Start: `npm run start`
- Same three env vars as above
- Node 20+ required

### What's already handled for production
- Custom `error.tsx` (a real "something went wrong" page instead of the
  framework's raw error overlay) and `not-found.tsx`
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, a restrictive `Permissions-Policy`) applied to every
  route in `next.config.ts`
- Full password reset flow (`/forgot-password` → email → `/reset-password`)
  — this was missing entirely until this pass and would have permanently
  locked out anyone who forgot their password
- Signup correctly branches on whether Supabase requires email
  confirmation: if it does, the person sees a real "check your email"
  screen instead of being silently bounced back to `/login` with no
  explanation
- `robots.txt` (indexes public pages, excludes authenticated/admin
  routes), a dynamic `sitemap.xml` (includes every live opportunity page,
  not just static routes), and a web app manifest for "add to home
  screen" on mobile
- Every admin page independently re-checks `is_admin` server-side (not
  just RLS or nav-hiding) — verified across all five admin routes
- Dashboard surfaces a real error state if the applications query fails,
  distinct from the legitimate "you have no applications yet" empty state

### Before real users sign up — a genuine launch checklist
These are things that either can't be verified from this environment
(no live Supabase project, no real domain) or are product/business
decisions, not code:

- [ ] **Domain & SSL** — point your real domain at the deployment; Vercel
      handles SSL automatically.
- [ ] **Supabase Auth URL configuration** — Site URL and Redirect URLs
      (Authentication → URL Configuration) must include your real
      production domain, or auth email links (confirmation, password
      reset) will point at `localhost`.
- [ ] **Email confirmation** — decide whether to require it (Supabase
      Auth setting). Either way, the signup flow now handles both cases
      correctly.
- [ ] **Transactional email deliverability** — Supabase's default email
      sending is rate-limited and fine for testing, but for real signup/
      password-reset volume, configure a custom SMTP provider (Supabase
      Auth → SMTP Settings) so emails don't land in spam or get
      throttled.
- [ ] **At least one real admin account** — see §3.3, step 3 — or no one
      can manage the catalog after launch.
- [ ] **Re-verify all seeded scholarship data** against official sources
      — deadlines move. Use the staleness check in `/admin`.
- [ ] **Storage bucket** — confirm `documents` exists and is **not**
      public (`schema.sql` creates it with `public: false`).
- [ ] **Brand assets** — `app/manifest.ts` currently ships with an empty
      `icons` array on purpose (a manifest pointing at icon files that
      don't exist is worse than one honestly admitting it has none). Add
      real icon files and populate that array before relying on "add to
      home screen."
- [ ] **Content Security Policy** — deliberately **not** included in the
      security headers this pass. A CSP needs to be tuned against your
      actual deployed domain (Supabase auth redirects, GSAP, any CDN
      usage) and a wrong one silently breaks the app rather than failing
      loudly. Add one only after testing it against the real deployment.
- [ ] **Rate limiting** — Supabase's platform-level auth rate limits cover
      login/signup brute-forcing. The custom RPC functions
      (`start_application`, `admin_analytics_summary`,
      `flag_stale_opportunities`) have no additional rate limiting — fine
      at small scale, worth adding (e.g. via Supabase Edge Functions or a
      proxy) before high traffic.
- [ ] **Backups** — enable Supabase's point-in-time recovery or scheduled
      backups (Database → Backups) before there's real user data worth
      losing.
- [ ] **Monitoring** — the app logs unhandled errors to the console
      (`app/error.tsx`) but nothing ships them anywhere. Wire up a real
      error-tracking service (Sentry, Vercel's own observability, etc.)
      before launch if you want to know when something breaks for a real
      user.

None of the above are code changes waiting to happen — they're
configuration and operational steps that only make sense once a real
Supabase project and domain exist.

---

## 5. Project structure

```
app/
  page.tsx                     Landing page
  (auth)/login, /signup        Auth pages
  onboarding/                  Progressive profile setup
  dashboard/                   Authenticated home
  opportunities/                Search + detail pages (eligibility, save, report)
  applications/                 List, workspace, and compare view
  planning/                    Standing plan
  documents/                    Document vault (upload, versions, attach)
  calendar/                    Agenda + month views
  saved/                       Bookmarked opportunities
  countries/                    Catalog-grounded country directory (public)
  tools/cgpa/                   CGPA calculator
  ai/                           "Coming soon, premium" AI tools preview
  admin/                        Dashboard, opportunity CRUD, reports, analytics
components/
  AppShell.tsx                  Authenticated layout (sidebar / bottom nav / notification bell)
  NotificationBell.tsx          Live-computed deadline alerts
  StatusBadge.tsx, TrustIndicator.tsx, GlossaryTerm.tsx, RevealSection.tsx
  PageViewTracker.tsx, OfficialLink.tsx, PlanSummaryCard.tsx
  admin/                        OpportunityForm, ReportsQueue, AnalyticsCharts, StalenessCheckButton
  visuals/                      GSAP-driven decorative illustrations
lib/
  supabase/                     Browser / server / middleware Supabase clients
  types/database.ts             Hand-written row types matching schema.sql
  deadlines.ts                  Deadline-phase calculation + daysSince (tested)
  analytics.ts                  trackEvent() — fire-and-forget event logging
  hooks/useScrollReveal.ts      Reusable GSAP scroll-reveal hook
scripts/
  check-types-sync.mjs           Drift guard: every schema table has a matching TS interface
supabase/
  schema.sql                    Full DB schema + RLS + Storage + RPC functions
  seed.sql                      Five real, sourced sample scholarships
  migrations/
    002_phase2_admin_and_reports.sql
    003_phase3_document_vault.sql
```

---

## 6. Admin dashboard

Reachable at `/admin` for any user with `is_admin = true` on their
profile. Enforced both server-side on every admin page and by Postgres
RLS policies, so it holds even if someone bypasses the UI.

- **`/admin`** — catalog metrics, opportunity list, staleness/
  verification warnings, a "Run staleness check" button, a link into open
  user reports
- **`/admin/opportunities/new`** and **`/[id]/edit`** — full opportunity
  form
- **`/admin/reports`** — user-reporting queue
- **`/admin/analytics`** — see §7

---

## 7. Analytics

`admin_analytics_summary(p_days)` checks the caller is an admin, then
returns totals, a day-by-day event chart, an events-by-type breakdown,
top-5 opportunities by view/click, and applications-by-status — computed
server-side in one round trip. Tracked via `lib/analytics.ts`'s
`trackEvent()`: `page_view`, `opportunity_view`,
`opportunity_official_link_click`, `opportunity_tracked`,
`search_performed`, `signup`, `login`. Fire-and-forget; fails silently.

RLS lets any signed-in or anonymous visitor *insert* an event tied only
to their own account (or none), but only admins can *read* the log —
there's no user-facing "my activity" view in this build.

---

## 8. Document vault

Three tables model this (see `supabase/schema.sql` §10):

- **`documents`** — the logical, named document (e.g. "CV"), owned by one
  user
- **`document_versions`** — every uploaded revision, numbered and never
  overwritten; one version is marked `current_version_id` on the parent
  document
- **`application_documents`** — the many-to-many link between a document
  and the applications using it, so uploading a CV once and attaching it
  to five applications doesn't duplicate the file

Files themselves live in a **private** Supabase Storage bucket named
`documents`. Storage paths follow `{user_id}/{document_id}/{version}-
{filename}`, which is also how the Storage RLS policies enforce ownership
— no separate lookup table needed, and the path can't be spoofed since
`auth.uid()` is server-verified. Downloads go through a signed URL
(`createSignedUrl`, 60-second expiry) rather than a public link.

10MB per-file limit, enforced client-side before upload starts.

---

## 9. Calendar and notifications

`/calendar` aggregates two sources into one list: every tracked
application's `application_deadline`, and every task with a `deadline`
set. Two views — **Agenda** (flat, upcoming-first list; the default,
since it's the most useful on mobile) and **Month** (a real grid with
day cells, today highlighted, up to 2 items shown per day with a "+N
more" overflow).

The notification bell (desktop sidebar + mobile header) is **not** backed
by a stored notifications table or an email pipeline — there's no actual
delivery mechanism in this codebase, and a fake one would be worse than
none. Instead it computes, live, on every load: any application deadline
or open task due within 14 days, sorted soonest-first, with a red badge
count. This is an honest MVP version of "notifications" — real push/email
delivery is scoped in §16.

---

## 10. Application comparison

`/applications/compare` — pick 2+ tracked applications (a simple checkbox
picker when nothing's selected yet, driven by a `?ids=` query param) and
see a side-by-side table: country, degree level, funding type, duration,
deadline, application fee, language and work-experience requirements, and
your own tracked status. Rows where every selected application has a null
value are omitted automatically rather than shown as a wall of "Not
specified." Always paired with a reminder to check the official page for
anything that might have changed.

---

## 11. Automated staleness flagging

`flag_stale_opportunities(p_threshold_days default 60)` is a Postgres
function that downgrades `trust_level` from `officially_verified` to
`needs_verification` for any non-archived opportunity whose
`last_verified_at` is older than the threshold. It:

- never touches opportunities already at `needs_verification` or
  `user_reported` (nothing to downgrade)
- never touches archived opportunities
- returns the number of rows it changed

**Two ways to run it:**
1. **Manually** — the "Run staleness check" button on `/admin` calls it
   via `supabase.rpc()` and reports how many opportunities were flagged.
2. **Automatically** — if your Supabase plan has the `pg_cron` extension
   available (Pro tier and above, or self-hosted), uncomment the
   `cron.schedule(...)` call at the bottom of `schema.sql` (or the
   equivalent in migration 003) to run it daily at 03:00 UTC. It's
   commented out by default so `schema.sql` runs cleanly on every
   Supabase tier, including ones without `pg_cron`.

---

## 12. Planning

`/planning` is deliberately separate from "track an opportunity" — a
place to state intent before or alongside picking specific programs:
target degree, target intake (free text — intake naming varies too much
globally for a rigid dropdown), countries of interest, funding
preference, and open notes. Feeds the dashboard's plan-summary card and
the eligibility checker's degree-level comparison. Stored on `profiles`
— one standing plan per user, not multiple named plans.

---

## 13. AI tools (coming soon)

`/ai` describes four planned premium features (application assistant,
document review, preparation plans, program comparison) and is written
so that when they ship, the same constraint applies as everywhere else in
this app: **grounded only in the user's own stored data, never inventing
a deadline, requirement, or eligibility rule.** No AI API calls exist
anywhere in this codebase yet.

---

## 14. Testing

```bash
npm test          # run once
npm run test:watch # watch mode
```

23 tests across two files, chosen for where a regression would actually
hurt a real applicant, not for coverage-percentage's sake:

- **`lib/deadlines.test.ts`** (13 tests) — `daysRemaining`, `daysSince`,
  and every `deadlinePhase` boundary (the exact thresholds the dashboard
  and admin warnings rely on to color urgency), plus a UTC day-boundary
  regression guard on `formatDeadline`.
- **`app/opportunities/[id]/EligibilityChecker.test.ts`** (10 tests) —
  locks in the checker's core safety property: nationality, work-
  experience, and academic-standing checks can **never** return `"meets"`
  — even with a strong CGPA on file — only `"needs_verification"` or
  `"unknown"`. A future edit that accidentally let the checker assert
  eligibility would fail a test, not just slip into production.

No end-to-end tests yet (see §16).

---

## 15. Design notes

The visual identity avoids generic SaaS styling — a document/ledger
metaphor (hairline borders, warm paper background, a brass accent
evoking an official stamp) over blue gradients and stock photography.
Illustrations (the route map, the document stack) and the analytics
charts are original SVG/CSS compositions, not a charting library or
licensed imagery.

**Why `/countries` has no editorial content:** an earlier draft of this
feature considered hand-written guides (visa processes, typical
documents, application timelines per country). That's exactly the kind
of unverifiable, easy-to-go-stale content the rest of this app explicitly
avoids — the AI-tools page promises never to invent eligibility rules,
and admin opportunities require a real source URL. Writing prose "guide"
content with no citation would have broken that pattern. `/countries`
instead groups the *actual catalog* by country — true by construction,
even if thinner than a full guide.

Motion (GSAP) is purposeful, not decorative, and every animation checks
`prefers-reduced-motion`.

---

## 16. Roadmap

**Near-term, building on what exists:**
- Real email/push delivery behind the notification bell (currently
  computed live with no stored queue or delivery mechanism — see §9)
- Editorial country/university guides with real citations, once there's
  a process for keeping them current (the honest version of what
  `/countries` deliberately isn't yet)
- End-to-end tests (Playwright) covering the signup → track → requirement
  → task → submit flow
- Replace `lib/types/database.ts` with real Supabase-generated types
  once a live project exists to introspect:
  ```bash
  npx supabase gen types typescript --project-id <your-project-ref> \
    > lib/types/database.generated.ts
  ```
  `npm run check-types-sync` exists as a stopgap drift-guard until then —
  it confirms every table has a matching interface, not that every field
  does.
- A user-facing "my activity" view of their own analytics events, if
  that's ever wanted (currently admin-only by design)
- Retention/archival policy for `analytics_events` (currently grows
  unbounded)
- Rate limiting on the RPC functions (`start_application`,
  `admin_analytics_summary`, `flag_stale_opportunities`) before public
  launch

**Phase 4+**
- Real AI application assistant behind a server-side layer (replace the
  `/ai` placeholder)
- Verified organization/university submissions
- Institutional accounts and partnerships
- Premium subscription tier + billing (the `/ai` page already assumes a
  premium gate exists — it doesn't yet)
- Full university/program explorer with independently maintained content

---

## 17. Known limitations

- The eligibility checker is a simple rules-based comparison, not a
  guarantee — enforced by tests now (§14), not just UI copy.
- Five opportunities are seeded — real and sourced, but a demonstration
  catalog, not production scale. The admin dashboard makes growing it
  through a real UI possible.
- No end-to-end tests yet — only unit tests on the two highest-risk pure-
  logic areas.
- No rate limiting on Supabase RPC calls.
- Analytics events accumulate indefinitely with no retention policy.
- The AI tools page is UI-only; no backend or model integration exists.
- The notification bell computes live and has no persistence or actual
  delivery (no email/push) — see §9 and §16.
- `/countries` reflects only catalog data, not independently-verified
  editorial guidance on visas, costs, or process — see §15 for why that's
  a deliberate choice, not an oversight.
- `lib/types/database.ts` is hand-written, cross-checked against the
  schema by `npm run check-types-sync` at the table level only (not
  field-level) — see §16 for the real fix once a live Supabase project
  exists to generate types from.

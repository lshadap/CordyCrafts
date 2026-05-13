# Roadmap: Cordy's Crafts

## Overview

Migrate the existing Claude Design CDN prototype into a production-ready Vite 5 + React + Supabase SPA, deployed on Vercel. The journey runs in four phases: scaffold the buildable project (preserving all existing components), wire live Supabase data and WhatsApp order capture, polish the mobile layout and SEO, then verify and ship to production.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Vite Scaffold** - Migrate the CDN prototype into a buildable Vite 5 + React project without rewriting any components
- [x] **Phase 2: Supabase Integration** - Wire live data, write orders/bookings to Supabase before WhatsApp link opens, enable RLS
- [x] **Phase 3: Mobile Polish** - Responsive grid layouts, loading skeletons, and SEO/OG meta tags
- [ ] **Phase 4: Vercel Deploy** - Connect GitHub to Vercel, set env vars, verify production, write setup docs

## Phase Details

### Phase 1: Vite Scaffold
**Goal**: The CDN prototype runs as a proper Vite 5 + React build — all Claude Design components imported as ES modules, CartContext replacing window globals, and vercel.json committed
**Depends on**: Nothing (first phase)
**Requirements**: SCAF-01, SCAF-02, SCAF-03, SCAF-04, SCAF-05, SCAF-06
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts without errors and the full prototype UI renders in the browser
  2. All four Claude Design files (primitives.jsx, hero.jsx, products.jsx, sections.jsx) load as ES modules with zero component rewrites
  3. Cart add/remove/quantity operations work using CartContext — no window.cart, window.openCart, or window.cartCount globals remain
  4. Missing any of the three env vars causes the app to throw a loud startup error listing the missing variable(s)
  5. `vercel.json` with SPA rewrite rule is present in the repository root
**Plans**: 7 plans across 5 waves
Plans:

**Wave 0** (test infrastructure):
- [x] 01-00-PLAN.md — Install vitest/jsdom, create CartContext.test.jsx and main.test.jsx stubs

**Wave 1** *(parallel — independent files)*:
- [x] 01-01-PLAN.md — Vite scaffold: package.json, vite.config.js, index.html rewrite, vercel.json, .env.example, assets to public/
- [x] 01-02-PLAN.md — CartContext (useReducer + localStorage) and src/lib/supabase.js stub

**Wave 2** *(blocked on Wave 1 completion)*:
- [x] 01-03-PLAN.md — Migrate src/primitives.jsx and src/hero.jsx as ES modules
- [x] 01-04-PLAN.md — Migrate src/products.jsx as ES module (delete cart store, fix exports)

**Wave 3** *(blocked on Wave 2 completion)*:
- [x] 01-05-PLAN.md — Migrate src/sections.jsx as ES module (import inr, useCartContext)

**Wave 4** *(blocked on Wave 3 completion)*:
- [x] 01-06-PLAN.md — Wire src/App.jsx and src/main.jsx; env validation; visual verify

**Cross-cutting constraints:**
- All 4 Claude Design files must have zero component rewrites (SCAF-02, CLAUDE.md)
- No window globals may remain after Wave 4 (SCAF-04)
- CartContext API surface must match the original window.cart object exactly
**UI hint**: yes

### Phase 2: Supabase Integration
**Goal**: Products and classes load live from Supabase; every order and booking is persisted to the database before the WhatsApp message opens; RLS locks down the tables
**Depends on**: Phase 1
**Requirements**: SUPA-01, SUPA-02, SUPA-03, SUPA-04, SUPA-05, SUPA-06, WA-01, WA-02, WA-03
**Success Criteria** (what must be TRUE):
  1. Products and classes render from Supabase rows — adding a row in the Supabase table editor makes it appear on the page on next load
  2. Submitting the cart checkout form writes an `orders` row (with payment_status='pending') to Supabase, then opens the pre-filled wa.me link — the WhatsApp link never opens if the Supabase write fails
  3. Submitting the class booking form writes a `bookings` row (with payment_status='pending') to Supabase, then opens the pre-filled wa.me link — same guard as above
  4. The WhatsApp message includes item names, quantities, ₹ totals, and customer name for orders; class name, date/time, seats, mode, and customer name for bookings — number is always from VITE_WHATSAPP_NUMBER
  5. An unauthenticated anon client can INSERT to orders and bookings but cannot SELECT, UPDATE, or DELETE any row
**Plans**: 4 plans across 4 waves
Plans:

**Wave 0** (test infrastructure):
- [x] 02-00-PLAN.md — whatsapp.test.js (RED stub for WA-01/02/03) + supabase.test.js (GREEN guard pattern for SUPA-04/05)

**Wave 1** *(runs parallel to Wave 0)*:
- [x] 02-01-PLAN.md — supabase/migrations/...sql (4 tables + RLS + 4 policies) + supabase/seed.sql (12 products + 8 classes) + manual schema push

**Wave 2** *(blocked on Waves 0 + 1 completion)*:
- [x] 02-02-PLAN.md — src/lib/whatsapp.js + src/hooks/useProducts.js + src/hooks/useClasses.js + src/products.jsx wired to live data with field renames

**Wave 3** *(blocked on Wave 2 completion)*:
- [x] 02-03-PLAN.md — src/sections.jsx CartDrawer + BookingModal: async INSERT-then-WhatsApp guards with inline red error UX + manual browser verification

**Cross-cutting constraints:**
- Supabase client initialized only in `src/lib/supabase.js` — never in any other file (SUPA-01)
- `payment_status='pending'` on every INSERT to orders and bookings (all 4 waves)
- Supabase write MUST complete before wa.me link opens — on error, link is never opened (SUPA-04, SUPA-05)
- `VITE_WHATSAPP_NUMBER` always from `import.meta.env` — never hardcoded (WA-03)
**UI hint**: yes

### Phase 3: Mobile Polish
**Goal**: The site is genuinely usable on a phone — responsive grids, visible loading states, and correct meta tags for search and social sharing
**Depends on**: Phase 2
**Requirements**: PLSH-01, PLSH-02, PLSH-03, PLSH-04, PLSH-05, PLSH-06
**Success Criteria** (what must be TRUE):
  1. On a 375px-wide viewport the product grid shows 2 columns; at 768px it shows 3; at 1280px it shows 4
  2. On a 375px-wide viewport the classes grid shows 1 column; at 768px and above it shows 2
  3. While products are loading from Supabase, skeleton cards are visible in place of real cards (no blank white space or layout shift)
  4. While classes are loading from Supabase, skeleton cards are visible in place of real cards
  5. Each page has a distinct `<title>` and `<meta name="description">`, and the home page has og:title, og:description, and og:image tags
**Plans**: 3 plans across 2 waves
Plans:

**Wave 1** *(parallel — independent files)*:
- [x] 03-01-PLAN.md — src/hooks/useBreakpoint.js — viewport breakpoint hook (mobile/tablet/desktop)
- [x] 03-03-PLAN.md — index.html — SEO/OG/Twitter meta tags + @keyframes shimmer style block

**Wave 2** *(blocked on Wave 1 completion)*:
- [x] 03-02-PLAN.md — src/products.jsx — responsive columns + shimmer skeleton loading for ProductGrid and ClassesGrid

**Cross-cutting constraints:**
- No new CSS files — @keyframes shimmer is the only CSS outside JS inline styles (CLAUDE.md)
- No component rewrites — ProductGrid and ClassesGrid are modified in-place (CLAUDE.md)
- useBreakpoint must be called before any conditional return in components (React rules-of-hooks)
- Skeleton counts: 12 product cards, 8 class cards (D-04)
**UI hint**: yes

### Phase 4: Vercel Deploy
**Goal**: The site is live on a Vercel URL, auto-deploys from main, all env vars are set in Vercel, and a developer can set up the project locally from the README
**Depends on**: Phase 3
**Requirements**: DEPL-01, DEPL-02, DEPL-03, DEPL-04
**Success Criteria** (what must be TRUE):
  1. Pushing a commit to main triggers an automatic Vercel deployment with no manual steps
  2. Navigating directly to a deep route (e.g., /products) in the browser returns the app, not a 404
  3. On the production URL: cart persists across page refresh, and WhatsApp order and booking links open correctly on an Android device and an iOS device
  4. A new developer can clone the repo, follow README instructions, and run the site locally without asking Cordeelia for anything beyond the env var values
**Plans**: 3 plans across 3 waves
Plans:

**Wave 1** *(autonomous — code work)*:
- [ ] 04-01-PLAN.md — README.md with local setup, env var reference, tech stack, project structure

**Wave 2** *(blocked on Wave 1, manual user steps)*:
- [ ] 04-02-PLAN.md — Vercel: import GitHub repo → set project name `cordyscrafts` → set 3 env vars → first deploy

**Wave 3** *(blocked on Wave 2, manual production verification)*:
- [ ] 04-03-PLAN.md — Production verification: SPA routing, cart persistence, WhatsApp links on Android + iOS

**Cross-cutting constraints:**
- Production URL: `https://cordyscrafts.vercel.app` — no custom domain (D-01)
- Vercel project name must be exactly `cordyscrafts` (D-02) — og:image URL depends on this
- README covers local dev only — no Vercel setup or Supabase migration steps (D-06, D-07)
- All 3 env vars must be set in Vercel before first build: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_WHATSAPP_NUMBER (D-04)
**UI hint**: no

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Vite Scaffold | 7/7 | Complete | 2026-05-07 |
| 2. Supabase Integration | 4/4 | Complete | 2026-05-07 |
| 3. Mobile Polish | 3/3 | Complete | 2026-05-08 |
| 4. Vercel Deploy | 0/3 | Not started | - |

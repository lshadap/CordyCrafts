---
phase: 02-supabase-integration
plan: "02"
subsystem: ui
tags: [supabase, react, hooks, whatsapp, fetch, products, classes]

# Dependency graph
requires:
  - phase: 02-supabase-integration
    plan: "00"
    provides: src/__tests__/whatsapp.test.js — WA-01/WA-02/WA-03 RED contract
  - phase: 02-supabase-integration
    plan: "01"
    provides: Supabase schema with products/classes tables + RLS policies

provides:
  - src/lib/whatsapp.js — pure WhatsApp message builders (buildOrderMessage, buildBookingMessage, buildWaUrl)
  - src/hooks/useProducts.js — React hook fetching products from Supabase on mount
  - src/hooks/useClasses.js — React hook fetching classes from Supabase on mount
  - src/products.jsx — ProductGrid + ClassesGrid wired to live Supabase data; field names match schema

affects:
  - 02-03 (CartDrawer + BookingModal submit handlers import from src/lib/whatsapp.js; klass.id uuid ready for FK insert)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Supabase data-fetch hook pattern: useState([]) + useState(true) + useEffect with empty dep array + silent error handling"
    - "WA message builder pattern: pure functions accepting form/items/total, joining lines array, conditional Notes omission"
    - "Loading guard pattern: if (loading) return null placed AFTER all useState calls (React rules-of-hooks compliance)"

key-files:
  created:
    - src/lib/whatsapp.js
    - src/hooks/useProducts.js
    - src/hooks/useClasses.js
  modified:
    - src/products.jsx

key-decisions:
  - "whatsapp.js is a standalone pure-function module (not embedded in sections.jsx) — cleaner test surface, Plan 03 imports it into CartDrawer/BookingModal"
  - "if (loading) return null placed after useState calls in both grids — required by React rules-of-hooks (hooks must be called in same order every render)"
  - "PRODUCTS and CLASSES hardcoded arrays removed entirely — no consumer outside products.jsx imports them (confirmed by grep); removes confusion about authoritative data source"
  - "accent column treated as text (nullable hex) not boolean — ProductCard checks !!p.accent which works for both null and text values"

patterns-established:
  - "Hook imports use named destructure from react: import { useState, useEffect } from 'react' (not React.useState inside hooks)"
  - "Components still use React.useState — hook files use destructured imports (matches existing project conventions)"
  - "Error path silent: if (!error && data) setData(data) then setLoading(false) unconditionally — no throw, no console.log"

requirements-completed: [SUPA-01, SUPA-02, SUPA-03, WA-01, WA-02, WA-03]

# Metrics
duration: "35min"
completed: "2026-05-07"
---

# Phase 2 Plan 02: WhatsApp Builders + Supabase Data Hooks Summary

**Pure WhatsApp message builders (whatsapp.js, 17 tests GREEN) + useProducts/useClasses Supabase fetch hooks + products.jsx wired to live data with Supabase column name renames**

## Performance

- **Duration:** 35 min
- **Started:** 2026-05-07T13:11:00Z
- **Completed:** 2026-05-07T13:46:26Z
- **Tasks:** 3
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments

- Created `src/lib/whatsapp.js` with `buildOrderMessage`, `buildBookingMessage`, `buildWaUrl` — turns whatsapp.test.js from RED to GREEN (17/17 assertions pass); zero console.log, PII-safe
- Created `src/hooks/useProducts.js` and `src/hooks/useClasses.js` — one-time Supabase fetch on mount, returns `{ data, loading }`, silent error handling per CONTEXT.md Area 2
- Refactored `src/products.jsx`: removed hardcoded PRODUCTS/CLASSES arrays, wired ProductGrid + ClassesGrid to hooks, updated all Supabase column names (p.cat→p.category, k.craft→k.category, k.date→k.date_label, k.blurb→k.subtitle, k.seats→k.seats_left, k.sku→k.id for React key)
- Full vitest run: 44/44 tests passed (was 27 before); npm run build exits 0; SUPA-01 invariant confirmed (createClient only in src/lib/supabase.js)

## Task Commits

1. **Task 1: Implement src/lib/whatsapp.js** - `fe34192` (feat) — whatsapp.test.js RED→GREEN
2. **Task 2: Create useProducts and useClasses hooks** - `933c3ff` (feat) — SUPA-02/SUPA-03
3. **Task 3: Refactor products.jsx — wire to hooks; rename fields** - `820f5a9` (feat) — SUPA-02/SUPA-03

## Files Created/Modified

- `src/lib/whatsapp.js` — Pure WA message builders; exports buildOrderMessage, buildBookingMessage, buildWaUrl; reads VITE_WHATSAPP_NUMBER from import.meta.env at call time; no PII logging
- `src/hooks/useProducts.js` — useProducts() hook; fetches from Supabase products table on mount; returns { products, loading }; silent on error
- `src/hooks/useClasses.js` — useClasses() hook; identical pattern; fetches from classes table; returns { classes, loading }
- `src/products.jsx` — Removed PRODUCTS/CLASSES hardcoded arrays; added hook imports; ProductGrid + ClassesGrid use hooks + loading guard; ProductCard uses p.category; ClassCard uses k.category, k.date_label, k.subtitle, k.seats_left, k.id

## Decisions Made

- `whatsapp.js` lives in `src/lib/` (not `src/sections.jsx`) — the Plan 00 test contract explicitly imports from `../lib/whatsapp.js`, and this separation makes Plan 03 cleaner (sections.jsx just imports the builders)
- React rules-of-hooks: `if (loading) return null` is placed AFTER both hook calls (useProducts/useClasses + useState) in each grid, not at the top — required to avoid "more hooks than previous render" violations
- Hardcoded PRODUCTS/CLASSES arrays fully removed — confirmed no external consumers via `grep -r "import.*PRODUCTS\|import.*CLASSES" src/`
- `p.blurb` render in ProductCard preserved as-is (conditional `{p.blurb && ...}`) — Supabase schema has no blurb column; the column evaluates to undefined/null and the guard already handles it gracefully; no change needed

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

**Worktree directory confusion:** Initial file creation and first commit for Task 1 landed in the main repo (`/Users/.../CordyCrafts/`) instead of the worktree (`/Users/.../CordyCrafts/.claude/worktrees/agent-a337a90440299aa2c/`). The commit `fa00381` landed on `main` instead of the agent branch. The fix: copied the file to the worktree directory and committed again from the correct path. All three task commits `fe34192`, `933c3ff`, `820f5a9` are correctly on `worktree-agent-a337a90440299aa2c`. The `fa00381` commit on `main` is duplicate content that the orchestrator will reconcile during merge.

## User Setup Required

None — no external service configuration required for this plan. The hooks will fetch live data once the Supabase project is seeded (already done in Plan 01 Task 3).

## Next Phase Readiness

- Plan 03 can now import `{ buildOrderMessage, buildBookingMessage, buildWaUrl }` from `src/lib/whatsapp.js` for CartDrawer and BookingModal submit handlers
- `klass.id` (uuid) is now the React key and will be the FK for the bookings INSERT in Plan 03
- All 44 tests passing; no regressions
- Runtime: with live Supabase seeded, ProductGrid and ClassesGrid render live data from Supabase; empty grid while loading is the defined Phase 2 behavior (skeleton UI deferred to Phase 3)

## Threat Surface Scan

No new network endpoints, auth paths, or trust boundaries beyond what is described in the plan's threat_model. All threats T-02-02-01 through T-02-02-05 are addressed:
- T-02-02-02 (PII in WA builders): mitigated — zero console.log in whatsapp.js (verified by grep gate)
- T-02-02-03 (infinite re-fetch): mitigated — empty dep array `[]` in both hooks (verified by acceptance criteria)

## Self-Check

- `src/lib/whatsapp.js`: FOUND
- `src/hooks/useProducts.js`: FOUND
- `src/hooks/useClasses.js`: FOUND
- `src/products.jsx`: MODIFIED
- `fe34192` (whatsapp.js commit): FOUND
- `933c3ff` (hooks commit): FOUND
- `820f5a9` (products.jsx commit): FOUND

## Self-Check: PASSED

---
*Phase: 02-supabase-integration*
*Completed: 2026-05-07*

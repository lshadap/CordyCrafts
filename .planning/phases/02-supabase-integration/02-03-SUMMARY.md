---
phase: 02-supabase-integration
plan: "03"
subsystem: ui
tags: [supabase, react, whatsapp, insert, orders, bookings, rls, form]

# Dependency graph
requires:
  - phase: 02-supabase-integration
    plan: "00"
    provides: src/__tests__/supabase.test.js — SUPA-04/SUPA-05 guard contracts (RED)
  - phase: 02-supabase-integration
    plan: "01"
    provides: Supabase schema with orders/bookings tables + INSERT-only RLS policies
  - phase: 02-supabase-integration
    plan: "02"
    provides: src/lib/whatsapp.js helpers + useProducts/useClasses hooks + products.jsx wired to live data

provides:
  - src/sections.jsx — CartDrawer with async orders INSERT guard + wa.me redirect + inline error UX
  - src/sections.jsx — BookingModal with async bookings INSERT guard (class_id FK) + wa.me redirect + inline error UX
  - seat-cap math uses klass.seats_left (nullable, ?? 99 fallback)

affects:
  - 02-04 (Phase 2 complete after manual verification)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "INSERT-then-gate pattern: await supabase.from(table).insert({...}); if (error) { setError; return; }; window.open(waUrl, '_blank')"
    - "Submitting guard: disabled={submitting} + dimmed button color (#a0d8b3) while awaiting INSERT"
    - "Inline red error: conditional div with color: '#c0392b' below submit button, clears on next submission attempt"
    - "Items snapshot before c.clear(): const itemsSnapshot = [...c.items] captured before INSERT for use in setConfirmation and buildOrderMessage"

key-files:
  created: []
  modified:
    - src/sections.jsx

key-decisions:
  - "address: form.addr || '' — orders.address is NOT NULL; empty string acceptable when user leaves optional field blank"
  - "itemsSnapshot captured before INSERT (not after) and reused for both buildOrderMessage call and setConfirmation — ensures 'done' stage confirmation panel shows correct items even after c.clear()"
  - "window.open(waUrl, '_blank') not window.location.href — keeps SPA loaded while opening WhatsApp app on mobile"
  - "No .select() chained after .insert() — per Supabase v2 docs and 02-RESEARCH.md Pitfall 1; check error only (data:null on success is expected behavior)"

patterns-established:
  - "Two submit handlers now both async with identical guard structure — consistent pattern for any future form-to-Supabase flows"
  - "State reset on close (useEffect): setSubmitError(null) + setSubmitting(false) added alongside existing setStage/setConfirmation resets"

requirements-completed: [SUPA-04, SUPA-05, WA-01, WA-02, WA-03]

# Metrics
duration: "15min"
completed: "2026-05-07"
---

# Phase 2 Plan 03: CartDrawer + BookingModal INSERT Guards Summary

**async INSERT-then-WhatsApp guard wired into CartDrawer (orders table) and BookingModal (bookings table) — failed Supabase INSERT blocks wa.me redirect with inline red error; successful INSERT opens WhatsApp before confirmation stage**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-05-07T19:20:00Z
- **Completed:** 2026-05-07T19:35:00Z (Tasks 1-2 complete; Task 3 awaiting human verification)
- **Tasks:** 3 of 3 complete (Task 3 browser verification: PASSED 2026-05-07)
- **Files modified:** 1

## Accomplishments

- Wired `CartDrawer` submit with async Supabase `orders` INSERT + INSERT-then-gate guard: error path sets inline red error and blocks wa.me; success path calls `buildOrderMessage` + `buildWaUrl` + `window.open(_blank)` then sets confirmation and clears cart
- Wired `BookingModal` submit with async Supabase `bookings` INSERT using `class_id: klass.id` (uuid FK, not klass.sku per Pitfall 4 in RESEARCH.md); same error/success guard pattern
- Renamed `klass.seats` → `klass.seats_left` (with `?? 99` fallback for nullable column) in seat-cap math; display shows `?? '—'` when null
- Both submit buttons: `disabled={submitting}`, dimmed to `#a0d8b3` while sending, label shows "Sending..."
- Inline error div (`color: '#c0392b'`, locked per CONTEXT.md) renders below submit button on INSERT failure; clears on next attempt
- `items` JSONB for orders strips `img` and `cat` — only `{ sku, name, qty, price }` sent per schema constraint
- `npm run build` exits 0; `npx vitest run` 44/44 passing; SUPA-01 invariant holds (createClient only in src/lib/supabase.js)

## Task Commits

1. **Task 1 + Task 2: Wire CartDrawer + BookingModal async INSERT guards** - `19eeba8` (feat)

## Files Created/Modified

- `src/sections.jsx` — CartDrawer: added submitting/submitError state, async submit with orders INSERT guard, disabled button, inline error display; BookingModal: same pattern with bookings INSERT (class_id FK), klass.seats → klass.seats_left rename

## Decisions Made

- Tasks 1 and 2 both modify `src/sections.jsx` sequentially — committed together in a single feat commit since they are both surgical edits to the same component file with the same pattern
- `address: form.addr || ''` used in the INSERT payload because `orders.address` is NOT NULL; empty string is clean for the schema even when the user leaves the optional field blank
- `itemsSnapshot` is captured before the INSERT (not after) and used for both the message builder and `setConfirmation` — this ensures the confirmation panel on the 'done' stage correctly shows the items that were ordered, since `c.clear()` runs at the end of the success branch

## Deviations from Plan

None — plan executed exactly as written.

## Pending: Task 3 — Manual Browser Verification

**Status:** BLOCKING CHECKPOINT — awaiting human verification

Task 3 is a `type="checkpoint:human-verify"` gate. The automated code changes are complete and tested, but the end-to-end browser flow requires manual verification:

- **Step 1:** Dev server starts; ProductGrid (12 products) and ClassesGrid (8 classes) render from Supabase
- **Step 2:** Live Supabase data verified via Dashboard row insert
- **Step 3:** Happy path order — add product, fill form, "Send order to Cordeelia" → wa.me opens + row appears in Supabase orders table
- **Step 4:** Failure path order — set RLS policy WITH CHECK to `false` → submit → no wa.me opens, red error appears → restore policy
- **Step 5:** Happy path booking — Book Now, fill form → wa.me opens + row appears in bookings table with class_id uuid FK
- **Step 6:** Failure path booking — same RLS trick on bookings table
- **Step 7:** SUPA-06 verification — anon SELECT on orders/bookings returns `[]` (no PII readable by anon)

**Resume signal:** Type `verified`, `partial: <details>`, or `defer browser`

## Issues Encountered

None.

## User Setup Required

**Pre-requisites for Task 3 verification:**
1. `.env.local` must exist with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_WHATSAPP_NUMBER` (digits only, no '+')
2. Plan 01 Task 3 must have been completed (Supabase tables seeded with products and classes rows)

## Next Phase Readiness

- After Task 3 (`verified` signal received), Phase 2 is complete — all SUPA-* and WA-* requirements satisfied
- The final state: customer can browse live catalog, add to cart, submit order/booking via WhatsApp with Supabase row written before the redirect
- Phase 3 (loading skeletons, polish) can proceed once browser verification passes

## Known Stubs

None — all form data flows to real Supabase INSERT calls; helper functions are fully wired; no hardcoded test values in production code.

## Threat Surface Scan

No new network endpoints, auth paths, or trust boundaries beyond what is described in the plan's threat_model. Per T-02-03-01 (PII): no `console.log` statements in either submit handler — verified by grep. Error messages shown to users are the locked string only (`'Something went wrong — please try again.'`) with no leaked Supabase error details.

```bash
grep -n "console\." src/sections.jsx  # returns: no matches
```

## Self-Check

- `src/sections.jsx` modified: CONFIRMED
- `19eeba8` commit: CONFIRMED
- `grep -q "supabase.from('orders').insert"`: FOUND
- `grep -q "supabase.from('bookings').insert"`: FOUND
- `grep -q "class_id: klass.id"`: FOUND
- `grep -q "klass.seats_left ?? 99"`: FOUND
- `npm run build` exits 0: CONFIRMED
- vitest 44/44: CONFIRMED

## Self-Check: PASSED

---
*Phase: 02-supabase-integration*
*Completed: 2026-05-07 — all 3 tasks done, browser verification passed*

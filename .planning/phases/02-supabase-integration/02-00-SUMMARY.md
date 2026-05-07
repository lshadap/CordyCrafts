---
phase: 02-supabase-integration
plan: "00"
subsystem: testing
tags: [vitest, whatsapp, supabase, tdd, wave-0]

# Dependency graph
requires:
  - phase: 01-vite-scaffold
    provides: vitest config (globals:true, src/__tests__ include glob), CartContext.test.jsx pattern

provides:
  - src/__tests__/whatsapp.test.js — WA-01/WA-02/WA-03 behavioral contract (RED until Plan 02)
  - src/__tests__/supabase.test.js — SUPA-04/SUPA-05 insert-then-gate guard contract (GREEN)
  - src/__tests__/useProducts.test.js — SUPA-02 placeholder stub (GREEN)
  - src/__tests__/useClasses.test.js — SUPA-03 placeholder stub (GREEN)

affects:
  - 02-01 (must make whatsapp.test.js GREEN by shipping src/lib/whatsapp.js)
  - 02-03 (must implement CartDrawer/BookingModal submit handlers matching supabase.test.js guard pattern)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Inline guard logic tests: inlined async functions in test file (no production imports) for testing async patterns without @testing-library/react"
    - "RED stub pattern: test file imports from non-existent module to lock contract before implementation"
    - "Vitest globals: describe/it/expect without import statements (globals:true in vitest.config.js)"

key-files:
  created:
    - src/__tests__/whatsapp.test.js
    - src/__tests__/supabase.test.js
    - src/__tests__/useProducts.test.js
    - src/__tests__/useClasses.test.js
  modified: []

key-decisions:
  - "whatsapp.test.js imports from src/lib/whatsapp.js (not src/sections.jsx) — Plan 02 will export the message builders as a pure utility module, not from sections.jsx"
  - "supabase.test.js inlines guard logic rather than importing from production code — avoids @testing-library/react dependency while still locking the behavioral contract"
  - "useProducts/useClasses stubs stay trivially passing — one RED test (whatsapp) is sufficient for Wave 0 RED-GREEN handoff"

patterns-established:
  - "WA message format locked: 'New Order\\nName: ...\\nPhone: ...\\nAddress: ...\\n\\nItems:\\n- {name} x{qty} ₹{lineTotal}\\n\\nTotal: ₹{grand}'"
  - "Booking message locked: omit Notes line when note is empty string"
  - "Guard pattern locked: check error not data — Supabase v2 insert returns data:null on success; ok:true if no error, ok:false if error"
  - "Payload contract locked: bookings use class_id (uuid FK), not class_sku; payment_status:'pending' on every insert"

requirements-completed: [WA-01, WA-02, WA-03, SUPA-04, SUPA-05]

# Metrics
duration: 2min
completed: 2026-05-07
---

# Phase 2 Plan 00: Wave 0 Test Harness Summary

**Vitest test stubs that lock WA-01/WA-02/WA-03 and SUPA-04/SUPA-05 contracts — one RED (whatsapp), four GREEN (supabase, useProducts, useClasses, Phase 1 regression clean)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-07T13:21:40Z
- **Completed:** 2026-05-07T13:23:38Z
- **Tasks:** 5 (4 file-creating + 1 verification-only)
- **Files modified:** 4 created

## Accomplishments

- Created `whatsapp.test.js` with 17 assertions encoding the exact WA message format (including ₹ symbol, x{qty}, address fallback, conditional Notes line, wa.me URL encoding) — RED until Plan 02 ships `src/lib/whatsapp.js`
- Created `supabase.test.js` with 8 assertions encoding the insert-then-gate guard pattern using inline mock supabase injection — GREEN immediately, no production imports
- Created `useProducts.test.js` and `useClasses.test.js` as passing placeholder stubs closing the SUPA-02 and SUPA-03 Wave 0 gaps from VALIDATION.md
- Full vitest run: 1 FAIL (whatsapp — module-not-found), 5 PASS, 27 passing tests, 0 Phase 1 regressions

## Task Commits

1. **Task 1: whatsapp.test.js — failing stub for WA-01/WA-02/WA-03** - `253c525` (test)
2. **Task 2: supabase.test.js — passing guard tests for SUPA-04/SUPA-05** - `e3a849b` (test)
3. **Task 3: useProducts.test.js — placeholder stub for SUPA-02** - `b887656` (test)
4. **Task 4: useClasses.test.js — placeholder stub for SUPA-03** - `6e7c6a0` (test)
5. **Task 5: Full vitest sanity-check** - (no commit — verification-only)

## Files Created/Modified

- `src/__tests__/whatsapp.test.js` — 3 describe blocks (buildOrderMessage WA-01, buildBookingMessage WA-02, buildWaUrl WA-03); 17 assertions; imports from non-existent `../lib/whatsapp.js`
- `src/__tests__/supabase.test.js` — 2 describe blocks (submitOrder SUPA-04, submitBooking SUPA-05); 8 assertions; inline guard logic; zero production imports
- `src/__tests__/useProducts.test.js` — trivial placeholder, closes SUPA-02 Wave 0 gap
- `src/__tests__/useClasses.test.js` — trivial placeholder, closes SUPA-03 Wave 0 gap

## Vitest Run Results (Task 5 verification)

| Test File | Status | Tests | Notes |
|-----------|--------|-------|-------|
| CartContext.test.jsx | PASS | 7 | Phase 1 — no regression |
| main.test.jsx | PASS | 6 | Phase 1 — no regression |
| supabase.test.js | PASS | 8 | Wave 0 — GREEN immediately |
| useProducts.test.js | PASS | 1 | Wave 0 placeholder — GREEN |
| useClasses.test.js | PASS | 1 | Wave 0 placeholder — GREEN |
| whatsapp.test.js | FAIL | 0 | Intentional RED — module-not-found for `../lib/whatsapp.js` |

**Total: 27 passed, 1 failed suite (expected)**

## Decisions Made

- `whatsapp.test.js` imports from `src/lib/whatsapp.js` (not `src/sections.jsx` as the PATTERNS.md section suggested) because the PLAN.md task 1 explicitly specifies `../lib/whatsapp.js` and the key_links in the plan frontmatter confirm this path. Plan 02 must export `buildOrderMessage`, `buildBookingMessage`, `buildWaUrl` from `src/lib/whatsapp.js`.
- `supabase.test.js` has zero import statements — all guard logic is inlined — matching the PLAN.md specification exactly.

## Deviations from Plan

None — plan executed exactly as written. All 4 test files created with exact content specified in the plan. vitest run produces the expected mixed RED/GREEN state.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 02 (whatsapp.js) has a clear target: create `src/lib/whatsapp.js` exporting `buildOrderMessage`, `buildBookingMessage`, `buildWaUrl` that make `whatsapp.test.js` GREEN
- Plan 03 (sections wiring) has a clear target: implement CartDrawer/BookingModal submit handlers using the guard pattern verified in `supabase.test.js`
- Wave 0 harness complete — all downstream plans have automated tests to verify against

---
*Phase: 02-supabase-integration*
*Completed: 2026-05-07*

---
phase: 2
slug: supabase-integration
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-07
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 |
| **Config file** | `vitest.config.js` (exists from Phase 1) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 02-00-01 | 00 | 0 | WA-01, WA-02 | Message never includes VITE_WHATSAPP_NUMBER value in body | unit | `npx vitest run whatsapp.test` | ✅ W0 | ⬜ pending |
| 02-00-02 | 00 | 0 | SUPA-04, SUPA-05 | INSERT error blocks wa.me link | unit | `npx vitest run supabase.test` | ✅ W0 | ⬜ pending |
| 02-01-01 | 00 | 0 | SUPA-02 | useProducts returns [] on error (placeholder stub — fuller hook tests deferred) | unit | `npx vitest run useProducts.test` | ✅ W0 | ⬜ pending |
| 02-01-02 | 00 | 0 | SUPA-03 | useClasses returns [] on error (placeholder stub — fuller hook tests deferred) | unit | `npx vitest run useClasses.test` | ✅ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | WA-01 | Order message has item names, qtys, ₹ totals, customer name | unit | `npx vitest run whatsapp.test` | ✅ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | SUPA-04 | Failed order INSERT → no wa.me open | unit | `npx vitest run supabase.test` | ✅ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | WA-02 | Booking message has class name, seats, mode, customer name | unit | `npx vitest run whatsapp.test` | ✅ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | SUPA-05 | Failed booking INSERT → no wa.me open | unit | `npx vitest run supabase.test` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/__tests__/whatsapp.test.js` — stubs for WA-01, WA-02, WA-03 (created in Plan 00)
- [x] `src/__tests__/supabase.test.js` — stubs for SUPA-04, SUPA-05 with inlined guard logic (created in Plan 00)
- [x] `src/__tests__/useProducts.test.js` — placeholder stub for SUPA-02 (created in Plan 00)
- [x] `src/__tests__/useClasses.test.js` — placeholder stub for SUPA-03 (created in Plan 00)
- [x] Pure functions covered by whatsapp.test.js: `buildOrderMessage(form, items, total)`, `buildBookingMessage(form, klass)`, `buildWaUrl(message)`
- [x] Insert-then-gate guard pattern covered by supabase.test.js via inlined `submitOrder`/`submitBooking` async helpers (mock supabase client; no production import — see 02-RESEARCH.md Environment Availability for why @testing-library/react is out of scope)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Supabase client only in supabase.js | SUPA-01 | Code review / grep | `grep -r createClient src/` — must return exactly 1 result |
| RLS INSERT-only for anon on orders | SUPA-06 | SQL not unit-testable | Supabase Dashboard → Table Editor → orders → RLS policies |
| RLS INSERT-only for anon on bookings | SUPA-06 | SQL not unit-testable | Supabase Dashboard → Table Editor → bookings → RLS policies |
| Products appear on page after row added | SUPA-02 | Browser verification | Add row in Supabase table editor, reload localhost:5173 |
| Classes appear on page after row added | SUPA-03 | Browser verification | Add row in Supabase table editor, reload localhost:5173 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (whatsapp.test.js, supabase.test.js, useProducts.test.js, useClasses.test.js — all in Plan 00)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved

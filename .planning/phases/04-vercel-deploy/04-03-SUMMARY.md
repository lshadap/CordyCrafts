---
plan: 04-03
status: complete
duration: ~20 min
---

## What Was Done

Production verification of `https://cordyscrafts.vercel.app` on real devices.

## Verification Results

| Check | Result |
|-------|--------|
| 1. SPA routing — /products direct URL | Pass |
| 2. Cart persistence across refresh | Pass |
| 3. WhatsApp order link — Android | Pass |
| 4. WhatsApp booking link — iOS | Pass |
| 5. Mobile layout — no horizontal scroll | Pass |

## Bug Fixed During Verification

**iOS WhatsApp not opening:** `window.open(waUrl, '_blank')` was blocked by iOS Safari when called after `await` (no longer within synchronous user gesture). Fixed by switching both CartDrawer and BookingModal to `window.location.href = waUrl`. iOS intercepts the `wa.me` URL and opens WhatsApp directly.

Commit: `86c58d3` — fix(ios): use location.href for WhatsApp links to bypass Safari popup block

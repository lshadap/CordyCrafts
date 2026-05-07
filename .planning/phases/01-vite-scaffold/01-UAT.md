---
status: complete
phase: 01-vite-scaffold
source: [01-00-SUMMARY.md, 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md, 01-06-SUMMARY.md]
started: 2026-05-07T00:00:00Z
updated: 2026-05-07T00:01:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Run `npm run dev` from scratch. Server starts without errors, app loads at http://localhost:5173, and the Cordy's Crafts UI is visible (not a blank page or error screen).
result: pass

### 2. Full UI renders — all sections visible
expected: The page shows all sections in order from top to bottom: sticky Nav with Logo and cart icon, Hero with "Hand-made," / italic "with love." headline, 4-column Categories strip (Paper Crafts, Clay, Candles, Classes & Events), product grid with cards and ₹ prices, classes grid with booking buttons, dark About section, pink Newsletter section, dark Instagram strip (5 tiles), and Footer.
result: pass

### 3. CSS design tokens applied
expected: The Cordy's Crafts script font is visible in the Logo text and the hero headline second line. The coral/pink color scheme (#f08a8a) is applied throughout — not default browser black-on-white. Nav has a frosted-glass look.
result: pass

### 4. Cart — add a product
expected: Click "Add" on any product card. The cart icon in the Nav immediately shows a coral badge with the count (e.g., "1"). The "Add" button briefly turns green and says "Added".
result: pass

### 5. Cart — open CartDrawer
expected: Click the cart icon in the Nav. A panel slides in from the right showing "Your cart" header, the item you added with its name, category, ₹ price, and quantity controls (− and +). The backdrop behind the drawer is dimmed.
result: pass

### 6. Cart — quantity controls and remove
expected: In the open CartDrawer, click "+" to increase quantity — the item qty and line price update. Click "−" until qty reaches 0 — the item disappears from the cart. Alternatively, click "Remove" directly.
result: pass

### 7. Cart — localStorage persistence across refresh
expected: Add a product to cart so the Nav badge shows a count. Refresh the page (Cmd+R / F5). After reload, the Nav badge still shows the same count without re-adding anything. The cart item is preserved.
result: pass

### 8. Env var validation — missing vars show error screen
expected: Temporarily rename .env.local (e.g., `mv .env.local .env.local.bak`), then restart `npm run dev` and reload localhost:5173. A red error screen appears listing the MISSING VARIABLE NAMES (e.g., VITE_SUPABASE_URL) — NOT their values. Restore with `mv .env.local.bak .env.local`.
result: pass

### 9. vercel.json SPA rewrite present
expected: Run `cat vercel.json` in the project root. The file contains a rewrites rule with `"source": "/(.*)"` and `"destination": "/index.html"` — ensuring deep routes return the app instead of 404 on Vercel.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]

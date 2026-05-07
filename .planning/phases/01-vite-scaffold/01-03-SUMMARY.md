---
phase: 01-vite-scaffold
plan: 03
subsystem: ui
tags: [react, vite, jsx, es-modules]

requires:
  - phase: 01-02
    provides: CartContext and supabase stub as ES modules
provides:
  - src/primitives.jsx — Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider as named exports
  - src/hero.jsx — Nav (cartCount/onOpenCart props), Hero, Categories, CategoryTile as named exports
  - window globals eliminated from both files
affects: [01-05, 01-06]

tech-stack:
  added: []
  patterns: [ES module named exports replacing Object.assign(window), prop-based cart integration replacing window globals]

key-files:
  created: [src/primitives.jsx, src/hero.jsx]
  modified: []

key-decisions:
  - "Nav receives cartCount and onOpenCart as props — window.openCart and window.cartCount removed"
  - "All image paths prefixed /assets/ (Vite public dir convention)"

patterns-established:
  - "Component files start with import React from 'react' and end with export { ... }"
  - "Nav cart badge driven by cartCount prop, cart open driven by onOpenCart callback"

requirements-completed: [SCAF-02]

duration: 15min
completed: 2026-05-07
---

# Plan 01-03: Primitives + Hero Migration Summary

**primitives.jsx and hero.jsx converted to ES modules — window globals replaced with named exports and prop-based cart API**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-05-07
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- src/primitives.jsx: all 7 UI atoms exported as named ES module exports; React import added
- src/hero.jsx: Nav signature extended with `cartCount` and `onOpenCart` props replacing `window.openCart`/`window.cartCount`
- Image paths corrected to `/assets/` prefix throughout hero.jsx and categories tiles

## Task Commits

1. **Task 1+2: Migrate primitives.jsx and hero.jsx** - `581451a` (feat)

## Files Created/Modified
- `src/primitives.jsx` - Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider as named ES exports
- `src/hero.jsx` - Nav/Hero/Categories/CategoryTile as named ES exports; window globals → props

## Decisions Made
- Nav's `cartCount` prop receives the count value (not the `count()` function) — App.jsx calls `count()` and passes the result

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
- 01-03 subagent hit Bash permission wall before committing; files were written correctly and committed inline by orchestrator

## Next Phase Readiness
- src/primitives.jsx and src/hero.jsx ready for import by App.jsx
- No blockers

---
*Phase: 01-vite-scaffold*
*Completed: 2026-05-07*

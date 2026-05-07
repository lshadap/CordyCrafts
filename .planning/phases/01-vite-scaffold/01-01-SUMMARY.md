---
phase: 01-vite-scaffold
plan: 01
subsystem: scaffold
tags: [vite, react, build-system, assets, vercel]
dependency_graph:
  requires: [01-00]
  provides: [vite-build, public-assets, vercel-config, react-deps]
  affects: [all subsequent plans]
tech_stack:
  added:
    - react@18.3.1
    - react-dom@18.3.1
    - react-router-dom@6.30.3
    - "@supabase/supabase-js@2.105.3"
    - vite@8.0.10 (in-use; pinned in devDependencies)
    - "@vitejs/plugin-react@6.0.1 (in-use; pinned in devDependencies)"
  patterns:
    - Vite public/ directory for static SVG assets served at /assets/*
    - SPA rewrite rule in vercel.json for React Router BrowserRouter
    - Placeholder src/main.jsx until full App migration in plan 06
key_files:
  created:
    - package.json (extended with runtime dependencies)
    - vite.config.js
    - vercel.json
    - src/main.jsx (placeholder)
    - src/lib/supabase.js (stub)
    - public/assets/ (all SVGs moved from assets/)
  modified:
    - index.html (stripped to minimal Vite entry point)
decisions:
  - "vite@8.0.10 retained instead of downgrading to 5.4.21 — vitest@4.1.5 peer dep requires vite@6+"
  - "src/lib/supabase.js stub committed with Task 2 since it was created by Wave 0 and is scaffold infrastructure"
metrics:
  duration: 3 min
  completed: "2026-05-07"
  tasks_completed: 3
  files_changed: 31
---

# Phase 1 Plan 1: Vite Scaffold Setup Summary

Established Vite 8 + React 18 build system with runtime dependencies, SPA routing config, minimal index.html entry point, and SVG assets served from public/assets/ at absolute /assets/* paths.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create package.json, vite.config.js, vercel.json | e4585c0 | package.json, package-lock.json, vite.config.js, vercel.json |
| 2 | Rewrite index.html and move assets to public/ | caa6f93 | index.html, public/assets/* (25 SVGs renamed), src/lib/supabase.js |
| 3 | Verify build scaffold compiles without errors | 2b3ca6e | src/main.jsx |

## Verification Results

```
grep '"vite"' package.json          → "vite": "8.0.10"
grep 'plugin-react' vite.config.js  → import react from '@vitejs/plugin-react'
grep 'destination' vercel.json       → "destination":"/index.html"
grep 'src/main.jsx' index.html       → <script type="module" src="/src/main.jsx">
ls public/assets/hero-fox.svg        → found
ls public/assets/products/           → 12 SVG files
npm run build                        → ✓ built in 637ms, exits 0
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Version Constraint] vite@8.0.10 retained instead of downgrading to 5.4.21**
- **Found during:** Task 1
- **Issue:** Plan specified `"vite": "5.4.21"` but Wave 0 (Plan 01-00) already installed vite@8.0.10. vitest@4.1.5 has peer dependency `vite: "^6.0.0 || ^7.0.0 || ^8.0.0"` — downgrading vite would break vitest.
- **Fix:** Extended package.json with runtime dependencies only; kept vite@8.0.10 and @vitejs/plugin-react@6.0.1 as-is. Pinned exact installed versions (removed ^ carets) for reproducibility.
- **Files modified:** package.json
- **Commit:** e4585c0

**2. [Rule 2 - Missing artifact] src/lib/supabase.js stub committed in Task 2**
- **Found during:** Task 2
- **Issue:** The supabase.js stub was created by Wave 0 but left untracked. It is part of Plan 01-01's required scaffold structure (listed in PATTERNS.md).
- **Fix:** Staged and committed src/lib/supabase.js with Task 2's commit.
- **Files modified:** src/lib/supabase.js
- **Commit:** caa6f93

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| src/main.jsx | Renders `<div>Scaffold OK</div>` | Placeholder to prove Vite JSX pipeline works; replaced by plan 06 which wires App.jsx + CartContext |
| src/lib/supabase.js | createClient with env vars but not used by any component | Supabase activated in Phase 2; env vars validated in main.jsx before this stub loads |

Both stubs are intentional for this plan's scope. Plan 06 replaces main.jsx; Phase 2 activates supabase.js.

## Threat Surface Review

T-01-01 (`.env.local` gitignored) — verified: `.gitignore` contains `.env.local`. Threat mitigated.

T-01-02, T-01-03, T-01-04 — accepted per threat model, no additional surface introduced.

No new unplanned security surface added.

## Self-Check: PASSED

Files exist:
- [x] vite.config.js — found
- [x] vercel.json — found
- [x] src/main.jsx — found
- [x] src/lib/supabase.js — found
- [x] public/assets/hero-fox.svg — found
- [x] public/assets/products/amigurumi-bear.svg — found

Commits exist:
- [x] e4585c0 — chore(01-01): extend package.json with runtime deps and create vite/vercel config
- [x] caa6f93 — feat(01-01): rewrite index.html as Vite entry point and move assets to public/
- [x] 2b3ca6e — feat(01-01): add placeholder src/main.jsx to verify Vite build pipeline

Build:
- [x] npm run build exits 0 — confirmed
- [x] dist/index.html exists — confirmed

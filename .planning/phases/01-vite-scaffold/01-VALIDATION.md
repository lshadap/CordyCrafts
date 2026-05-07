---
phase: 1
slug: vite-scaffold
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-07
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (none detected — Wave 0 installs) |
| **Config file** | `vitest.config.js` — Wave 0 creates |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~30 seconds (build) + ~5 seconds (unit tests) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (exits 0 = no errors)
- **After every plan wave:** Run `npm run build` + manual browser smoke test
- **Before `/gsd-verify-work`:** Full suite green + `npm run dev` renders full prototype UI with no console errors; cart persists across refresh
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| scaffold-01 | 01 | 1 | SCAF-01 | — | N/A | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| scaffold-02 | 01 | 1 | SCAF-02 | — | N/A | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| scaffold-03 | 01 | 1 | SCAF-03 | — | N/A | manual | Visual browser check | — | ⬜ pending |
| scaffold-04 | 01 | 1-2 | SCAF-04 | — | N/A | unit + manual | `npx vitest run CartContext.test.jsx` | ❌ W0 | ⬜ pending |
| scaffold-05 | 01 | 1 | SCAF-05 | — | N/A | manual | `ls vercel.json` | — | ⬜ pending |
| scaffold-06 | 01 | 2 | SCAF-06 | — | N/A | unit | `npx vitest run main.test.jsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.js` — configure Vitest with jsdom environment for React
- [ ] `src/__tests__/CartContext.test.jsx` — stubs for SCAF-04 (reducer: add/remove/setQty/clear/count/total)
- [ ] `src/__tests__/main.test.jsx` — stub for SCAF-06 (missing env var validation)
- [ ] `vitest` + `@vitest/ui` + `jsdom` — install as devDependencies

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CSS design tokens render correctly (colors, fonts) | SCAF-03 | CSS custom property rendering is visual | Load `npm run dev`, inspect computed styles for `--cc-terracotta`, `--cc-font-serif` |
| Full prototype UI renders in browser | SCAF-01, SCAF-02 | Build exit code doesn't confirm UI correctness | Open browser at localhost, verify Nav/Hero/Products/CartDrawer all visible |
| Cart persists across page refresh | SCAF-04 | localStorage behavior requires browser session | Add product, refresh page, verify cart count unchanged |
| vercel.json present and correct | SCAF-05 | File existence check | `cat vercel.json` contains `"source":"/(.*)"` rewrite rule |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

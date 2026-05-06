# Technology Stack

**Project:** Cordy's Crafts
**Researched:** 2026-05-06
**Overall confidence:** HIGH — stack is locked by PROJECT.md constraints, not open for debate

---

## Status Note

The stack for this project is **non-negotiable** (stated explicitly in PROJECT.md). This file
documents what is already committed, current pinned versions from the prototype, and what must
be pin-verified before Vite migration starts.

---

## Recommended Stack

### Core Framework

| Technology | Version | Confidence | Purpose | Why | Pin-verify? |
|------------|---------|------------|---------|-----|-------------|
| React | 18.3.1 | HIGH — pinned in `index.html` SRI | UI component tree, hooks | Already in prototype; v18 concurrent features available if needed | YES — confirm latest 18.x patch before migration |
| Vite | 5.x | HIGH — stated in PROJECT.md | Dev server, build pipeline | Fast HMR, native ESM, first-class JSX; replaces CDN+Babel prototype | YES — pin to `5.x` latest stable; v6 is not yet stable |
| React Router | v6 | HIGH — stated in PROJECT.md | Client-side routing | Standard for Vite+React SPAs; `createBrowserRouter` + Vercel SPA fallback | YES — confirm v6 latest patch (v6.x not v7) |

### Backend / Data

| Technology | Version | Confidence | Purpose | Why | Pin-verify? |
|------------|---------|------------|---------|-----|-------------|
| Supabase JS client | 2.x | HIGH — env vars already wired | DB reads (products, classes) + DB writes (orders, bookings) | Client already chosen; table schemas defined; anon key pattern works for public catalogue | YES — `@supabase/supabase-js` latest 2.x; check for breaking changes between 2.x sub-versions |
| Supabase (hosted) | — | HIGH | PostgreSQL backend | No self-hosting needed; free tier covers v1 traffic | No — hosted service, no version to pin |

### Hosting / Deployment

| Technology | Version | Confidence | Purpose | Why | Pin-verify? |
|------------|---------|------------|---------|-----|-------------|
| Vercel | — | HIGH — stated in PROJECT.md | Static SPA hosting + auto-deploy | GitHub auto-deploy; `vercel.json` rewrite rule handles React Router; free tier sufficient | No — hosted service; add `vercel.json` with `{"rewrites":[{"source":"/(.*)", "destination":"/index.html"}]}` |

### Transpiler / Build (replaces current CDN Babel)

| Technology | Version | Confidence | Purpose | Why | Pin-verify? |
|------------|---------|------------|---------|-----|-------------|
| `@vitejs/plugin-react` | latest compatible with Vite 5 | HIGH | JSX transform, Fast Refresh | Official Vite React plugin; replaces `@babel/standalone` CDN script | YES — must match Vite 5 peer deps |

### Supporting Libraries

| Library | Version | Confidence | Purpose | When to Use | Pin-verify? |
|---------|---------|------------|---------|-------------|-------------|
| `@supabase/supabase-js` | ^2.x | HIGH | Supabase client | Required from Phase 1; lives only in `src/lib/supabase.js` | YES |
| `react-router-dom` | ^6.x | HIGH | Routing | Needed once multi-page routing is added (product detail, classes page) | YES |
| None beyond the above | — | HIGH | — | No UI component library (design is custom; Claude Design tokens are the system) | — |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | Vite 5 | Create React App | CRA is deprecated; Vite is the current standard |
| Build tool | Vite 5 | Next.js | PROJECT.md explicitly rules out SSR/Next.js |
| Routing | React Router v6 | TanStack Router | React Router v6 is already the stated constraint |
| Backend | Supabase | Firebase | Supabase already chosen by client; schemas already defined |
| Hosting | Vercel | Netlify | Vercel stated in PROJECT.md; both are equivalent for SPAs |
| Styling | CSS custom properties (existing) | Tailwind | Design system already built in `colors_and_type.css`; CSS vars must not be renamed |
| State | React `useState` / `useReducer` | Redux / Zustand | Cart state is local to a single page; global state manager is overkill for v1 |

---

## Installation (Vite migration)

```bash
# Bootstrap Vite + React project
npm create vite@5 cordy-crafts -- --template react

# Core runtime
npm install react@18 react-dom@18 react-router-dom@6

# Supabase
npm install @supabase/supabase-js

# Vite React plugin (dev)
npm install -D @vitejs/plugin-react
```

---

## Current Prototype Stack (pre-migration)

The prototype at repo root (`index.html`, `*.jsx`) uses:

| Technology | Version | Loaded via |
|------------|---------|-----------|
| React | 18.3.1 | CDN (`unpkg.com`) with SRI hash |
| React DOM | 18.3.1 | CDN (`unpkg.com`) with SRI hash |
| Babel Standalone | 7.29.0 | CDN (`unpkg.com`) with SRI hash |

These must be **preserved in place** and not broken. The migration creates a `src/` Vite project
alongside the prototype; the prototype root files are not deleted until migration is verified.

---

## Environment Variables

All three vars are required from day one. Confidence: HIGH (already in `.env.example`).

| Variable | Purpose | Source |
|----------|---------|--------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key | Supabase dashboard |
| `VITE_WHATSAPP_NUMBER` | Cordeelia's WhatsApp number | Client — NEVER hardcode |

Vite exposes vars prefixed `VITE_` to the browser bundle automatically via `import.meta.env`.

---

## Version Pin-Verify Checklist

Before starting the Vite migration, verify these exact versions:

- [ ] `react` — confirm latest `18.x.x` patch (currently pinned at `18.3.1` in prototype)
- [ ] `react-dom` — same as `react`
- [ ] `vite` — latest `5.x.x` stable (not v6)
- [ ] `@vitejs/plugin-react` — must satisfy Vite 5 peer deps
- [ ] `react-router-dom` — latest `6.x.x` (not v7; API differs)
- [ ] `@supabase/supabase-js` — latest `2.x.x`

---

## Design System Constraints (Hard Rules)

These are not stack choices — they are locked constraints enforced by CLAUDE.md:

- `colors_and_type.css` CSS variable names (`--cc-*`) must not be renamed
- SVG files in `assets/` and `assets/products/` must not be renamed or moved
- The Supabase client must be instantiated only in `src/lib/supabase.js`
- `VITE_WHATSAPP_NUMBER` must always be read from `import.meta.env`, never hardcoded

---

## Sources

- `PROJECT.md` — constraint definitions (stack is non-negotiable per that document)
- `.planning/codebase/STACK.md` — current prototype stack analysis
- `.planning/codebase/INTEGRATIONS.md` — integration audit
- `index.html` — pinned CDN versions with SRI hashes (React 18.3.1, Babel Standalone 7.29.0)
- `.env.example` — required environment variables
- CLAUDE.md — hard project rules (CSS vars, SVG paths, Supabase singleton, WhatsApp env var)

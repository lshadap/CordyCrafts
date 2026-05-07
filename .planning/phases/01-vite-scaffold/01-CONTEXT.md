# Phase 1: Vite Scaffold - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Convert the CDN/Babel browser prototype (`index.html` + 4 root-level JSX files) into a proper Vite 5 + React ES-module project. No component rewrites. CartContext replaces all window globals. Env vars validated at startup. `vercel.json` committed.

This phase does NOT fetch data from Supabase — that's Phase 2. All product/class data stays hardcoded from the existing arrays.

</domain>

<decisions>
## Implementation Decisions

### Src Directory Layout
- **D-01:** 4 Claude Design files live **flat in `src/`** — `src/primitives.jsx`, `src/hero.jsx`, `src/products.jsx`, `src/sections.jsx`. No subfolder. Mirrors the current root layout; minimizes migration churn.
- **D-02:** CartContext lives at **`src/CartContext.jsx`** — same flat level as component files.
- **D-03:** Supabase client at **`src/lib/supabase.js`** (per REQUIREMENTS.md — single location, never instantiated elsewhere).
- **D-04:** Entry files at **`src/main.jsx`** and **`src/App.jsx`**.
- **D-05:** Static assets moved to **`public/assets/`** — image src attributes updated from `"assets/..."` to `"/assets/..."` (absolute path). This is required for client-side routing to work correctly on deep routes. The SVG files are not renamed or moved within the folder structure; CLAUDE.md's "don't rename/move SVGs" constraint is satisfied.

### Tweaks Panel & Edit-Mode
- **D-06:** Tweaks panel **dropped entirely** — no ACCENTS/HEADLINES constants, no panel CSS, no postMessage edit-mode protocol (`__activate_edit_mode`, `__deactivate_edit_mode`, `__edit_mode_set_keys`), no `window.TWEAKS`.
- **D-07:** `App.jsx` uses a **single hardcoded accent color `'#f08a8a'`** (coral) and hardcoded headline copy inline. No state for tweaks. No `setKey`.
  - Hardcoded headline: `"Hand-made,\nwith love."`
  - Hardcoded sub: `"A little studio of three crafts — paper, candles, and polymer clay — all small-batch, all made by hand at the same kitchen table."`
- **D-08:** Claude Design components (`Nav`, `Hero`, etc.) still receive `accent` as a prop — **no rewrites to component internals**. App.jsx passes the hardcoded value as a prop.

### React Router v6
- **D-09:** `BrowserRouter` wraps `<App />` in **`main.jsx`** — App.jsx has no router knowledge.
- **D-10:** **Single `<Route path="/" element={<App />}>` only** — no placeholder routes for /products, /classes, etc. Future phases add routes if and when the design evolves to multi-page.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, requirements list (SCAF-01 to SCAF-06)
- `.planning/REQUIREMENTS.md` — Full SCAF-01 through SCAF-06 requirements with acceptance criteria

### Project Rules (hard constraints)
- `CLAUDE.md` — Non-negotiable rules: no component rewrites, no CSS variable renames, no SVG moves/renames, all prices in ₹, VITE_WHATSAPP_NUMBER from env only, Supabase client only in src/lib/supabase.js

### Source to Migrate
- `index.html` — CDN prototype; source of truth for App component structure, cartOpen/bookingFor state, and the inline CSS that needs to move somewhere appropriate
- `primitives.jsx` — Claude Design primitives (Icon, Logo, Button, CircleBadge, Overline, StitchDivider, HeartMark) — migrate as-is, change only exports
- `hero.jsx` — Nav, Hero components — migrate as-is, change only exports
- `products.jsx` — Cart store, useCart hook, inr(), PRODUCTS, CLASSES, ProductGrid, ProductCard, ClassesGrid, ClassCard — migrate as-is; cart store replaced by CartContext
- `sections.jsx` — About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal — migrate as-is, change only exports
- `colors_and_type.css` — Design tokens; imported globally in `main.jsx`; variable names must not change

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Cart store API** (`products.jsx:4-41`): `add(p)`, `remove(sku)`, `setQty(sku, qty)`, `clear()`, `count()`, `total()` — CartContext must expose the same API surface so CartDrawer and ProductCard work without rewrites
- **`useCart()` hook** (`products.jsx:34-41`): pub-sub pattern using `useReducer` force-update + `useEffect` listener lifecycle — CartContext replaces this; components using `useCart()` need updating to use `useContext(CartContext)` instead
- **`inr()` utility** (`products.jsx`): stays in `src/products.jsx` — no change

### Established Patterns
- **Inline styles dominant**: all component styles are inline JSX style objects referencing `var(--cc-*)` tokens — no new CSS files needed
- **`Object.assign(window, {...})`** at end of each JSX file: replaced by ES module `export` statements — the only change allowed to component files besides fixing import paths
- **`window.openCart`** set in App useEffect (`index.html:~135`): replaced by CartContext — CartDrawer's `open` prop and `onClose` callback remain; the trigger moves from window global to context
- **`window.cartCount`** badge in Nav: Nav reads `cart.count()` directly via `useCart()` — will use `useContext(CartContext)` instead

### Integration Points
- `main.jsx` → wraps `<BrowserRouter><App /></BrowserRouter>`, mounts to `#root`, imports `colors_and_type.css` globally
- `App.jsx` → provides `<CartContext.Provider>`, renders Nav/Hero/sections, passes hardcoded `accent` prop, manages `cartOpen` and `bookingFor` state
- `CartContext.jsx` → exposes cart state + dispatch (or API methods) consumed by ProductCard, ClassCard, CartDrawer, Nav
- `vercel.json` → must be at repo root with SPA rewrite before first push to main

### Env Var Validation
- SCAF-06 requires loud startup error if any of `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER` are missing — validation runs in `main.jsx` before rendering, throws an error or renders a visible error screen listing the missing variable(s)

</code_context>

<specifics>
## Specific Ideas

- Accent color in `App.jsx`: `const accent = '#f08a8a'` (coral, former default from `window.TWEAKS`)
- Headline in `App.jsx`: hardcoded `h` and `s` strings from the "warm" variant — no switching logic
- Image paths: global find-replace `src="assets/` → `src="/assets/` across the 4 component files (only change to asset references)
- `vercel.json` content: `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Vite Scaffold*
*Context gathered: 2026-05-07*

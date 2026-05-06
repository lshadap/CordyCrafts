# Domain Pitfalls

**Domain:** CDN React prototype → Vite 5 + React Router v6 + Supabase SPA on Vercel
**Project:** Cordy's Crafts
**Researched:** 2026-05-06
**Confidence:** HIGH (pitfalls grounded in actual codebase analysis + well-established Vite/Supabase/Vercel behavior)

---

## Critical Pitfalls

Mistakes that cause broken deploys, data leaks, or rewrites.

---

### Pitfall 1: `window` globals silently become `undefined` in ES module scope

**What goes wrong:**
The prototype assigns component functions and shared state to `window` across four separate `<script type="text/babel">` tags loaded sequentially. In Vite, every `.jsx` file is an ES module with its own scope. `window.openCart`, `window.cartCount`, `window.cart`, `window.PRODUCTS`, `window.CLASSES` — and the `Object.assign(window, {...})` calls at the bottom of `products.jsx` and `sections.jsx` — are load-order tricks that only work because the browser executes CDN scripts synchronously, top to bottom.

Specific references that will silently break:
- `hero.jsx:33` — `window.openCart && window.openCart()` in Nav's cart button
- `hero.jsx:38` — `(window.cartCount || 0) > 0` for the cart badge count
- `products.jsx:32` — `window.cartCount = this.count()` inside `_notify()`
- `products.jsx:124-125` — `Object.assign(window, { ProductGrid, ClassesGrid })` 
- `sections.jsx:507` — `Object.assign(window, { About, Newsletter, ..., CartDrawer, BookingModal })`
- `index.html:114` — `window.openCart = () => setCartOpen(true)` set in a `useEffect` (fine in isolation, but Nav reads it before the effect runs on first render)

**Why it happens:**
Vite compiles each file independently. Import order is declared, not positional. `window.openCart` is `undefined` on first render of Nav because the `useEffect` in App that sets it has not fired yet — this is a React lifecycle issue masked by the CDN's synchronous loading.

**Consequences:**
- Cart icon badge never shows count (reads stale `window.cartCount` at render time)
- Cart button does nothing on first click (openCart is undefined until after first mount)
- If any component file is imported before `products.jsx` exports its globals, runtime errors

**Prevention:**
Replace all `window.*` communication with React Context. Create a `CartContext` in `src/context/CartContext.jsx` that owns the cart store, `openCart` function, and cart count. Pass down via `useContext`. Nav reads count from context, not `window`. No `window` assignment anywhere.

**Warning signs:**
- Cart button clicks silently fail in dev
- Cart badge never increments even after adding items
- Console: "window.openCart is not a function"

**Phase:** Phase 1 (Vite migration scaffold). Must be resolved before any component works end-to-end.

---

### Pitfall 2: Supabase anon key + no RLS = public read/write to all tables

**What goes wrong:**
`VITE_SUPABASE_ANON_KEY` is intentionally public — it is embedded in the compiled JS bundle and visible to anyone who opens DevTools. This is by design for Supabase. The security model relies entirely on Row Level Security (RLS) policies being enabled on every table. If RLS is off (which is the Supabase default for new tables), the anon key grants full read and write access to every row in every table.

For this project: `orders` and `bookings` tables contain customer names, phone numbers (Indian mobile numbers), and delivery addresses. Without RLS:
- Any visitor can `SELECT * FROM orders` and read every customer's personal data
- Any visitor can `INSERT` fake orders or `DELETE` existing ones
- Any visitor can `UPDATE` prices, availability, or `is_active` flags on the `products` table

**Why it happens:**
Developers see "anon key is public" in Supabase docs and infer that the key itself provides security. It does not. The key identifies the project; RLS policies decide what the key can do.

**Consequences:**
- Full customer PII (name, phone, address) readable by anyone
- Orders can be fabricated or deleted
- Product prices can be changed client-side and written back to the database
- Indian PDPB (Personal Data Protection Bill) compliance violation

**Prevention:**
Before writing a single Supabase query, enable RLS on all four tables (`products`, `classes`, `orders`, `bookings`) and write explicit policies:

```sql
-- products: anon can read active products only
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products"
  ON products FOR SELECT TO anon
  USING (is_active = true);

-- orders: anon can insert only; cannot read or update
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert orders"
  ON orders FOR INSERT TO anon
  WITH CHECK (true);

-- bookings: anon can insert only
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert bookings"
  ON bookings FOR INSERT TO anon
  WITH CHECK (true);
```

Never grant `UPDATE` or `DELETE` to the anon role on `orders` or `bookings`.

**Warning signs:**
- Supabase dashboard shows RLS as "disabled" on any table (check Table Editor → each table → RLS toggle)
- `supabase.from('orders').select('*')` returns data without being logged in
- No policies listed under Authentication → Policies for a given table

**Phase:** Phase 2 (Supabase integration). RLS policies must be written and tested before any data is inserted from the live site.

---

### Pitfall 3: Vercel SPA routing — all routes 404 except `/`

**What goes wrong:**
Vercel serves static files. When a user navigates directly to `/shop`, `/classes`, or `/about` (or refreshes on those paths), Vercel looks for a file at that path, finds nothing, and returns a 404. React Router never gets a chance to handle the route because the HTML shell is never served.

This also affects: sharing a direct product URL, returning from an external OAuth flow (future), and any bookmark of an inner page.

**Why it happens:**
React Router works client-side — it intercepts browser history events. But a direct URL hit bypasses the browser entirely and goes straight to Vercel's file server.

**Consequences:**
- Every deep link returns a 404 in production
- Works perfectly in `vite dev` (Vite's dev server handles fallback by default)
- Social sharing links to specific products fail
- Google indexes the 404 pages

**Prevention:**
Add a `vercel.json` at the repo root before the first production deploy:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This must be committed before the first deploy. It cannot be added retroactively to fix already-indexed 404s without a re-crawl.

**Warning signs:**
- Works on `localhost:5173` but returns 404 on Vercel preview URLs when navigating directly
- Vercel deployment logs show no `vercel.json` detected

**Phase:** Phase 1 (project scaffold). Add `vercel.json` on day one, before any route is created.

---

### Pitfall 4: WhatsApp wa.me link never actually opens — the prototype doesn't build it

**What goes wrong:**
This is a gap in the prototype, not just a migration risk. The `submit` handler in both `CartDrawer` (sections.jsx:200-206) and `BookingModal` (sections.jsx:373-376) does this on submit:

```js
// CartDrawer submit
setConfirmation({ ...form, total: c.total(), items: [...c.items] });
setStage('done');
c.clear();

// BookingModal submit
setStage('done');
```

Neither handler constructs a `wa.me` URL or calls `window.open`. The "order sent" confirmation screen is purely cosmetic — no WhatsApp message is ever dispatched. This is the entire business-critical flow and it is not implemented.

The correct wa.me format for India is:
```
https://wa.me/91XXXXXXXXXX?text=URL-encoded-message
```

Rules that commonly break:
1. The number must not include `+`, spaces, or dashes: `919876543210` not `+91 9876543210`
2. `VITE_WHATSAPP_NUMBER` in `.env.example` is already formatted correctly as `919876543210` — but this must be validated at startup
3. The `text` parameter must be `encodeURIComponent`-encoded — newlines as `%0A`, not literal line breaks
4. On iOS, `wa.me` opens in Safari before redirecting; `window.open` with `_blank` is sometimes blocked by popup blockers — use `window.location.href` or an `<a>` with `target="_blank"` rendered and auto-clicked

**Why it happens:**
The prototype was designed as a UI demonstration, not a working checkout. The "done" stage is a placeholder.

**Consequences:**
- Every order attempt silently succeeds on screen but reaches nobody
- Cordeelia receives zero WhatsApp messages
- Cart is cleared (data lost) with no actual order sent

**Prevention:**
When implementing the submit handler, use this pattern:
```js
const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER; // e.g. "919876543210"
const lines = [
  `New order from ${form.name}`,
  `Phone: +91 ${form.phone}`,
  `Address: ${form.addr || '—'}`,
  ...cart.items.map(i => `• ${i.name} x${i.qty} — ${inr(i.price * i.qty)}`),
  `Total: ${inr(cart.total())}`,
];
const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
window.open(url, '_blank', 'noopener');
```

Validate `waNumber` is set at app startup — if missing, show a visible error rather than silently failing.

**Warning signs:**
- "Send order" button shows "done" state but no WhatsApp opens
- `VITE_WHATSAPP_NUMBER` missing from `.env.local` with no startup warning

**Phase:** Phase 3 (WhatsApp checkout flow). This is the first phase where the actual wa.me link must be built and tested on a real device.

---

### Pitfall 5: VITE_ env vars missing in production silently return `undefined`

**What goes wrong:**
In Vite, `import.meta.env.VITE_SUPABASE_URL` is replaced at build time with a literal string. If the variable is not set in the Vercel environment when the build runs, it compiles to `undefined` — the Supabase client initializes with `undefined` as its URL, and every database call fails silently (or with a cryptic fetch error).

In development with `vite dev`, missing vars cause immediate console errors. In Vercel's build pipeline, the error only surfaces at runtime, after deploy, in front of real users.

**Why it happens:**
Developers set env vars in `.env.local` for local dev but forget to add them in Vercel's project settings (Settings → Environment Variables). The build succeeds because Vite does not validate that vars are defined.

**Consequences:**
- Supabase client initialized with `undefined` URL — all product/class fetches return errors
- WhatsApp number missing — every order attempt silently does nothing
- The site appears to load (HTML/CSS served) but all dynamic content fails

**Prevention:**
1. Add all three vars to Vercel project settings before the first production deploy: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`
2. Add a startup validation in `src/lib/supabase.js`:

```js
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}
```

3. Add WhatsApp number validation wherever it is first used.

**Warning signs:**
- Vercel build log does not show env vars being injected
- Site loads but product grid is empty with no console errors (fetch silently fails)
- `import.meta.env.VITE_SUPABASE_URL` logs as `undefined` in browser console

**Phase:** Phase 1 (scaffold setup). Env var wiring should be verified in the scaffold before any Supabase code is written.

---

### Pitfall 6: CSS from `colors_and_type.css` not applied after Vite migration

**What goes wrong:**
The prototype loads `colors_and_type.css` via `<link rel="stylesheet" href="colors_and_type.css">` in `index.html`. In Vite, CSS must either be imported in JS (`import './colors_and_type.css'`) or referenced correctly in the Vite-managed `index.html`. If the file is moved to `src/` without updating the reference, or if the import is forgotten, all CSS variables (`--cc-parchment`, `--cc-font-serif`, etc.) are undefined at runtime. Components will render with unstyled, broken layouts.

**Why it happens:**
The `index.html` in a Vite project is the build entrypoint but does not automatically pick up arbitrary file paths relative to the project root unless they are explicitly linked or imported.

**Consequences:**
- All typography, color tokens, and spacing variables evaluate to empty strings
- The entire design system collapses (white page or raw unstyled HTML)
- Failure mode looks identical to a complete CSS failure — hard to diagnose quickly

**Prevention:**
Keep `colors_and_type.css` at the project root (do not move it — per CLAUDE.md constraint). In Vite's `index.html`, keep the `<link>` tag pointing to it, or import it in `src/main.jsx`:

```js
// src/main.jsx
import '../colors_and_type.css'; // path relative to src/
```

Verify all `--cc-*` variables resolve in browser DevTools before proceeding to any component work.

**Warning signs:**
- Components render with no colors or fonts
- DevTools shows `--cc-parchment` as empty / unresolved
- `colors_and_type.css` requests return 404 in Network tab

**Phase:** Phase 1, first thing. The design system must work before any component migration begins.

---

### Pitfall 7: `Object.assign(window, {...})` at file bottom breaks tree-shaking and causes runtime errors

**What goes wrong:**
`products.jsx` ends with:
```js
window.PRODUCTS = PRODUCTS;
window.CLASSES = CLASSES;
```
And `sections.jsx` ends with:
```js
Object.assign(window, { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal, WhatsAppIcon });
```

In the CDN prototype this is how components in one file reference components defined in another — a global registry. In a Vite project, this is unnecessary (use ES module imports) and harmful:
1. Vite/Rollup will not tree-shake modules that have side effects on `window`
2. The `window` assignments must happen before the first render, which is not guaranteed in an async module graph
3. If any file is refactored to a named export without updating the `window` assignment, the reference breaks silently

**Prevention:**
Replace all cross-file `window.*` references with ES module imports/exports. Each component file exports its components with `export const` or `export default`. `App.jsx` imports directly. No `window` assignments in any module file.

**Warning signs:**
- Component referenced via `window.X` renders as `undefined` 
- Console: "X is not a function" or "cannot read properties of undefined"
- Works in dev (module loading order happens to be synchronous enough) but fails intermittently

**Phase:** Phase 1 (Vite migration). Every `window.*` global must be converted to a proper import before the scaffold is considered complete.

---

## Moderate Pitfalls

---

### Pitfall 8: `backdropFilter: 'blur(10px)'` not supported on older Android WebView

**What goes wrong:**
The Nav uses `backdropFilter: 'blur(10px)'` for the frosted glass effect. This property requires the `-webkit-backdrop-filter` vendor prefix on older iOS Safari (pre-15) and is not supported at all on Android WebView before Chrome 76. On unsupported browsers, the Nav becomes fully opaque with its background color, which is acceptable — but only if the background color is set. If it is not, the Nav becomes transparent over page content.

**Prevention:**
The Nav already has `background: 'rgba(255,250,250,0.92)'` as a fallback. Keep this. Add `-webkit-backdrop-filter` alongside `backdropFilter` when writing the CSS module or inline style version.

**Phase:** Phase 1. Check on Android during the first mobile smoke test.

---

### Pitfall 9: Mobile viewport — fixed drawer and modal overflow on small screens

**What goes wrong:**
`CartDrawer` uses `width: 460` with `maxWidth: '100vw'`. On a 375px iPhone screen the drawer is full width — correct. But `BookingModal` is centered at `width: 520, maxWidth: 'calc(100vw - 32px)'` with `maxHeight: 'calc(100vh - 32px)'`. On a short viewport (iPhone SE: 568px) with a tall booking form, the form content overflows with no scroll affordance visible. The modal has `overflowY: 'auto'` but iOS Safari's rubber-band scroll can obscure the bottom buttons.

**Prevention:**
Add `overscroll-behavior: contain` to the modal scroll container. Test on 375×667 (iPhone SE/6/7/8) which is the smallest common Indian budget phone viewport. Ensure the submit button is always visible without scrolling, or add a sticky footer inside the modal.

**Phase:** Phase 2 (when components are being migrated and mobile-tested).

---

### Pitfall 10: Cart badge count is stale on first render because `window.cartCount` is read inline

**What goes wrong:**
The Nav badge reads `window.cartCount || 0` directly in the render function. This is not reactive — if the cart updates, `window.cartCount` changes, but Nav does not re-render because it has no subscription to that change. In the prototype this is partially masked by the fact that Nav and App share a React tree and App re-renders propagate, but only because `useCart()` triggers a re-render of the nearest consumer, not Nav.

In Vite with proper module scope, this breaks definitively: Nav will always show 0.

**Prevention:**
Nav must subscribe to cart state via CartContext or `useCart()` hook. Do not read `window.cartCount` in any render function.

**Phase:** Phase 1 (part of the window globals refactor).

---

### Pitfall 11: `import.meta.env` vs `process.env` — wrong prefix causes silent undefined

**What goes wrong:**
Developers familiar with Create React App or Next.js expect `process.env.REACT_APP_*`. In Vite, the correct syntax is `import.meta.env.VITE_*`. If any code uses `process.env.*`, it will be `undefined` in Vite (Vite does not polyfill `process.env` by default). This is a common mistake when copying Supabase client initialization examples from non-Vite codebases.

**Prevention:**
All env var access uses `import.meta.env.VITE_*`. The `src/lib/supabase.js` file (the single init point) must use this form. Never write `process.env` in this project.

**Phase:** Phase 1 scaffold, Phase 2 Supabase wiring.

---

### Pitfall 12: Supabase client initialized multiple times crashes on hot reload

**What goes wrong:**
If `createClient()` is called in more than one file (e.g., once in `supabase.js` and once accidentally in a component), Supabase logs a warning and the second client uses stale auth state. During Vite HMR (hot module reload), if the module is not properly cached, `createClient` can be called on every save, creating connection pool issues in development.

**Prevention:**
CLAUDE.md already mandates a single init point in `src/lib/supabase.js`. Enforce this with a lint rule or comment:

```js
// src/lib/supabase.js — ONLY place Supabase is initialized. Do not import createClient elsewhere.
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(url, key);
```

All other files import `{ supabase }` from this module, never `createClient`.

**Phase:** Phase 2 (Supabase integration).

---

### Pitfall 13: Slow 4G performance — unoptimized SVGs block first paint

**What goes wrong:**
The prototype references 12+ SVG product images and 4 category SVG tiles via direct `<img src>` tags with no `loading="lazy"`. On a 4G connection averaging 5–15 Mbps (common in Indian tier-2/3 cities), all SVGs load simultaneously on page load. SVGs can be large when they contain embedded raster data or complex paths.

**Prevention:**
Add `loading="lazy"` to all product and class image tags that are below the fold. The hero image (above fold) does not get lazy loading. Since the project constraint forbids moving SVG files, optimize SVGs in-place (run `svgo` on `assets/products/`) and add lazy loading in the migrated component code.

**Phase:** Phase 4 (performance pass).

---

## Minor Pitfalls

---

### Pitfall 14: `postMessage` wildcard target origin — remove before production

**What goes wrong:**
`index.html:96` and `index.html:103` send `window.parent.postMessage({...}, '*')`. This is the edit-mode protocol for the Claude Design preview context. In the Vite-migrated site, this code should be removed entirely (edit mode is a CDN prototype feature). If left in, it sends app state to any parent frame the site is ever embedded in.

**Prevention:**
Remove the entire edit-mode `useEffect` (lines 90-98 of `index.html`) and the `setKey` function during the Vite migration. The tweaks panel is a prototype artifact; the production app uses hardcoded defaults (or Supabase config in a later milestone).

**Phase:** Phase 1.

---

### Pitfall 15: `ACCENTS` object duplicated in `index.html` vs design token system

**What goes wrong:**
`ACCENTS` is defined inline in `index.html:71-77` as a plain JS object. The actual accent color (`#f08a8a`) is also referenced as a literal in multiple component inline styles. If the brand accent ever changes, it must be updated in at least three places. In the Vite migration, this becomes more fragile because the `index.html` inline script is removed.

**Prevention:**
Extract `ACCENTS` to a `src/config/accents.js` or inline it directly in `colors_and_type.css` as additional CSS variables. The `accent` prop pattern (passing a hex value to every component) can be replaced with a CSS variable reference. This is a refactor that does not change visual output.

**Phase:** Phase 1 or Phase 2 — low priority, but resolve before component proliferation.

---

### Pitfall 16: Nav links use `href="#section"` — React Router breaks hash navigation

**What goes wrong:**
Nav links target `#shop`, `#classes`, `#about` as anchor hash links. This is fine for a single-page scroll app. When React Router v6 is added with multiple routes, hash links only work correctly on the home route (`/`). If a user is on `/cart` (future route), clicking "Shop" with `href="#shop"` will navigate to `/cart#shop`, not `/#shop`.

**Prevention:**
For a single-page scroll design (no separate route per section), use `<a href="/#shop">` for all nav links, or use React Router's `<HashLink>` from `react-router-hash-link`. Decide the routing model in Phase 1 before adding any `<Link>` components.

**Phase:** Phase 1 (routing decisions).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Vite scaffold setup | CSS variables undefined (Pitfall 6) | Import `colors_and_type.css` in `main.jsx` first thing; verify in DevTools before any component work |
| Vite scaffold setup | `vercel.json` missing (Pitfall 3) | Add `vercel.json` with SPA rewrite rule in the initial commit |
| Window globals refactor | Stale cart badge (Pitfall 10) | Replace `window.openCart` / `window.cartCount` with CartContext before touching any component |
| Window globals refactor | `Object.assign(window,...)` side effects (Pitfall 7) | Convert all cross-file refs to ES imports before running the app in Vite mode |
| Supabase integration | RLS disabled (Pitfall 2) | Write and test all 4 table policies before inserting a single row from the app |
| Supabase integration | Multiple client instances (Pitfall 12) | Enforce single-file init; add comment header to `supabase.js` |
| Env var wiring | Silent undefined in production (Pitfall 5) | Set all 3 vars in Vercel dashboard; add startup validation in `supabase.js` |
| WhatsApp checkout | wa.me link not built (Pitfall 4) | The prototype submit handlers are stubs; build the actual URL construction in Phase 3 |
| WhatsApp checkout | Indian number format (Pitfall 4) | `919876543210` format (no +, no spaces); validate that `VITE_WHATSAPP_NUMBER` matches this format |
| Mobile testing | Modal overflow on short viewports (Pitfall 9) | Test on 375×667 (iPhone SE) as the minimum supported viewport |
| Performance | Unoptimized SVGs on 4G (Pitfall 13) | Add `loading="lazy"` to all below-fold images during component migration |

---

## Sources

All pitfalls derived from direct analysis of the codebase (confidence: HIGH):
- `index.html` — CDN loading order, window globals, edit-mode protocol
- `products.jsx` — cart store implementation, window assignments, PRODUCTS/CLASSES globals
- `hero.jsx` — `window.openCart` and `window.cartCount` read at render time
- `sections.jsx` — submit handler stubs, wa.me link absent, modal overflow constraints
- `.env.example` — env var naming and format
- `.planning/codebase/CONCERNS.md` — documented tech debt and fragile areas
- `.planning/PROJECT.md` — constraints, out-of-scope decisions, stack choices

Vite env var behavior, Vercel SPA routing, Supabase RLS defaults, and wa.me URL format are
well-documented, stable behaviors. Confidence: HIGH based on training knowledge confirmed
consistent with project requirements.

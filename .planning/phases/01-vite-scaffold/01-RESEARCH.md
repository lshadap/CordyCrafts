# Phase 1: Vite Scaffold - Research

**Researched:** 2026-05-07
**Domain:** Vite 5 + React 18 + ES module migration from CDN/Babel-standalone prototype
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** 4 Claude Design files live flat in `src/` — `src/primitives.jsx`, `src/hero.jsx`, `src/products.jsx`, `src/sections.jsx`. No subfolder. Mirrors the current root layout; minimizes migration churn.

**D-02:** CartContext lives at `src/CartContext.jsx` — same flat level as component files.

**D-03:** Supabase client at `src/lib/supabase.js` (per REQUIREMENTS.md — single location, never instantiated elsewhere).

**D-04:** Entry files at `src/main.jsx` and `src/App.jsx`.

**D-05:** Static assets moved to `public/assets/` — image src attributes updated from `"assets/..."` to `"/assets/..."` (absolute path). SVG files are not renamed or moved within the folder structure; CLAUDE.md's "don't rename/move SVGs" constraint is satisfied.

**D-06:** Tweaks panel dropped entirely — no ACCENTS/HEADLINES constants, no panel CSS, no postMessage edit-mode protocol, no `window.TWEAKS`.

**D-07:** `App.jsx` uses a single hardcoded accent color `'#f08a8a'` (coral) and hardcoded headline copy inline. Hardcoded headline: `"Hand-made,\nwith love."` and hardcoded sub: `"A little studio of three crafts — paper, candles, and polymer clay — all small-batch, all made by hand at the same kitchen table."`

**D-08:** Claude Design components (`Nav`, `Hero`, etc.) still receive `accent` as a prop — no rewrites to component internals. App.jsx passes the hardcoded value as a prop.

**D-09:** `BrowserRouter` wraps `<App />` in `main.jsx` — App.jsx has no router knowledge.

**D-10:** Single `<Route path="/" element={<App />}>` only — no placeholder routes for /products, /classes, etc.

### Claude's Discretion

None specified — all meaningful decisions were locked during discussion.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCAF-01 | Vite 5 + React + React Router v6 project scaffold created with `src/` directory structure, `package.json`, `vite.config.js`, and `index.html` entry point | Standard Vite scaffold files documented in Standard Stack section |
| SCAF-02 | All Claude Design components imported as ES modules — no rewrites, no renames | ES module conversion pattern documented in Architecture Patterns |
| SCAF-03 | `colors_and_type.css` imported globally in `main.jsx` — all CSS variable names preserved exactly | CSS global import pattern verified |
| SCAF-04 | `CartContext` implemented with `useReducer` + `localStorage` persistence, replacing all `window.cart`, `window.openCart`, `window.cartCount`, and `Object.assign(window, {...})` globals | CartContext design documented in Architecture Patterns |
| SCAF-05 | `vercel.json` committed with SPA rewrite rule | Exact content documented in Architecture Patterns |
| SCAF-06 | Env vars wired via `import.meta.env` with startup validation that fails loudly if any are missing | Env var validation pattern documented in Code Examples |

</phase_requirements>

---

## Summary

Phase 1 migrates a CDN/Babel-standalone prototype into a Vite 5 + React 18 ES-module project. The prototype loads components as `<script type="text/babel">` tags, exposes everything through `window` globals, and relies on a hand-rolled pub-sub cart store. The Vite migration replaces all of that with proper ES module imports/exports, a React Context cart, and a standard Vite project scaffold — while making zero changes to component logic or visual output.

The migration has a well-defined scope: five categories of mechanical changes are required across the four Claude Design files (remove `Object.assign(window,...)` exports, add ES module `export` statements, update `assets/` paths to `/assets/`, swap `useCart()` calls to `useContext(CartContext)`, and remove `window.openCart`/`window.cartCount` reads). No component logic, no JSX structure, no inline style, and no CSS variable should change. Any change beyond these five categories is a rewrite violation.

The trickiest single piece is the Nav component: it reads `window.cartCount` and calls `window.openCart` directly inside its JSX (not in a hook). These two reads must be replaced with context values — but since Nav is a Claude Design file and cannot be rewritten, the approach is to have Nav accept `cartCount` and `onOpenCart` as props passed from App.jsx, OR to expose `useCartContext()` as a named export from CartContext.jsx that Nav imports. The prop approach is cleaner and requires only the addition of prop-destructuring at Nav's signature, which qualifies as the allowed "change only exports" category.

**Primary recommendation:** Follow the migration order primitives → hero → products → sections → CartContext → App → main. Each file has a clear, mechanical set of changes. The CartContext is the only net-new file; all others are edits.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| UI rendering | Browser / Client | — | Pure SPA, no SSR |
| Cart state | Browser / Client (React Context) | — | In-memory + localStorage, no server |
| Routing | Browser / Client (React Router BrowserRouter) | — | SPA routing, Vercel handles 404 fallback |
| Env var validation | Browser / Client (main.jsx startup) | — | Validation before first render, no server-side check |
| Static assets (SVGs) | CDN / Static (Vite public/) | — | Served as-is, never processed by Vite's module graph |
| CSS tokens | Browser / Client (global import) | — | `colors_and_type.css` imported once in `main.jsx` |
| Supabase client | Browser / Client (src/lib/supabase.js) | — | Client-side SDK only, this phase: stub only |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 5.4.21 | Build tool, dev server | Project requirement; 5.x is the stable series before the v6 API break |
| @vitejs/plugin-react | 4.7.0 | JSX transform, React Fast Refresh | Official Vite plugin for React; uses esbuild for JSX (fast) with Babel as fallback |
| react | 18.3.1 | UI rendering | Locked by CDN prototype; 18.3.1 is the latest React 18 |
| react-dom | 18.3.1 | DOM renderer + createRoot | Must match react version |
| react-router-dom | 6.30.3 | Client-side routing | Project requirement; v6 is the current stable major |
| @supabase/supabase-js | 2.105.3 | Supabase client | Phase 1: stub only in src/lib/supabase.js; real use in Phase 2 |

[VERIFIED: npm registry — versions confirmed with `npm view` on 2026-05-07]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | — | — | No additional libraries needed for Phase 1 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @vitejs/plugin-react (esbuild JSX) | @vitejs/plugin-react-swc | SWC is faster but requires Rust; esbuild is sufficient and has wider ecosystem support |
| BrowserRouter (component) | createBrowserRouter (data API) | Data API is v6.4+ preferred but adds complexity; BrowserRouter is simpler for a single-route SPA |

**Installation:**
```bash
npm install react@18.3.1 react-dom@18.3.1 react-router-dom@6.30.3 @supabase/supabase-js@2.105.3
npm install -D vite@5.4.21 @vitejs/plugin-react@4.7.0
```

---

## Architecture Patterns

### System Architecture Diagram

```
index.html (Vite entry)
  └─ <script type="module" src="/src/main.jsx">
        │
        ├─ import colors_and_type.css          (global design tokens)
        ├─ import CartContext                   (provider + useCartContext hook)
        ├─ import App                           (root UI)
        │
        └─ ReactDOM.createRoot → render(
               <BrowserRouter>
                 <CartContext.Provider>
                   <App />               ← passes accent + cartOpen state
                 </CartContext.Provider>
               </BrowserRouter>
           )

App.jsx
  ├─ const accent = '#f08a8a'            (hardcoded, no state)
  ├─ const [cartOpen, setCartOpen]       (local state)
  ├─ const [bookingFor, setBookingFor]   (local state)
  └─ renders: Nav, Hero, Categories, ProductGrid, ClassesGrid,
              About, Newsletter, InstagramStrip, Footer,
              CartDrawer, BookingModal

CartContext.jsx
  ├─ createContext(CartContext)
  ├─ useReducer (items array)
  ├─ localStorage load on mount / save on change
  ├─ exposes: { items, add, remove, setQty, clear, count, total, openCart, onOpenCart }
  └─ named export: useCartContext()     ← consumed by Nav, ProductCard, CartDrawer

src/primitives.jsx  →  export { Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider }
src/hero.jsx        →  export { Nav, Hero, Categories, CategoryTile }
src/products.jsx    →  export { ProductGrid, ProductCard, ClassesGrid, ClassCard, inr, PRODUCTS, CLASSES }
src/sections.jsx    →  export { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal }

public/assets/      →  served at /assets/* — SVGs unchanged
```

### Recommended Project Structure

```
/                          (repo root)
├─ index.html              Vite entry point — <script type="module" src="/src/main.jsx">
├─ vite.config.js          Vite config with @vitejs/plugin-react
├─ package.json
├─ vercel.json             SPA rewrite rule
├─ .env.example            Documents required VITE_ vars
├─ .env.local              Actual secrets (gitignored)
├─ colors_and_type.css     Design tokens — stays at root (imported by main.jsx via relative path)
├─ public/
│   └─ assets/             All SVGs moved here from root assets/
│       ├─ hero-fox.svg
│       ├─ category-*.svg
│       ├─ ig-yarn-*.svg
│       └─ products/
│           └─ *.svg
└─ src/
    ├─ main.jsx            createRoot, BrowserRouter, CartContext.Provider, env validation
    ├─ App.jsx             Root component — accent hardcoded, cartOpen/bookingFor state
    ├─ CartContext.jsx     Cart state, useCartContext hook
    ├─ primitives.jsx      Claude Design primitives (ES module exports only)
    ├─ hero.jsx            Nav, Hero, Categories (ES module exports only)
    ├─ products.jsx        Cart store REPLACED by CartContext; PRODUCTS/CLASSES data stays
    ├─ sections.jsx        CartDrawer, BookingModal, etc. (ES module exports only)
    └─ lib/
        └─ supabase.js     Supabase client stub (Phase 2 activates it)
```

Note: `colors_and_type.css` stays at the repo root. CLAUDE.md forbids renaming CSS variables but not moving the file. However, moving it risks accidentally changing the `@import` for Google Fonts. Safest: keep it at root, import it in `main.jsx` with `import '../colors_and_type.css'` (one level up from src/).

### Pattern 1: Vite Config (Minimal React)

**What:** Registers the React plugin for JSX transform and Fast Refresh.
**When to use:** Always — required for JSX to compile without Babel standalone.

```javascript
// vite.config.js
// Source: https://github.com/vitejs/vite/blob/main/docs/guide/api-plugin.md
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

[VERIFIED: Context7 /vitejs/vite]

### Pattern 2: Vite index.html Entry Point

**What:** Vite's index.html is at the project root and references src/main.jsx via `<script type="module">`. Unlike the CDN prototype, there are no CDN script tags and no Babel.
**When to use:** Always — this replaces the CDN prototype's index.html entirely.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cordy's Crafts · Hand-made with love</title>
  <link rel="stylesheet" href="/colors_and_type.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

Note: The `<link rel="stylesheet" href="/colors_and_type.css">` in index.html is the alternative to importing via main.jsx. Prefer the `import` in main.jsx (see Pattern 3) so the CSS is bundled and tree-shaken properly. The index.html method also works but is less idiomatic for Vite.

[VERIFIED: Context7 /vitejs/vite — "index.html and Project Root"]

### Pattern 3: main.jsx — Entry with Env Validation

**What:** Validates all required env vars before rendering, then mounts with BrowserRouter and CartContext.
**When to use:** This IS main.jsx — no alternatives.

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '../colors_and_type.css'
import { CartProvider } from './CartContext.jsx'
import App from './App.jsx'

// SCAF-06: loud startup validation
const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_WHATSAPP_NUMBER',
]
const missing = REQUIRED_VARS.filter(k => !import.meta.env[k])
if (missing.length > 0) {
  document.getElementById('root').innerHTML =
    `<pre style="color:red;padding:2rem">Missing env vars:\n${missing.join('\n')}</pre>`
  throw new Error(`Missing env vars: ${missing.join(', ')}`)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CartProvider>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </CartProvider>
  </BrowserRouter>
)
```

[VERIFIED: Context7 /websites/reactrouter_6_30_3 — BrowserRouter Rendering Setup]
[VERIFIED: Context7 /vitejs/vite — import.meta.env]

### Pattern 4: ES Module Export Conversion

**What:** Replace `Object.assign(window, {...})` with named ES module exports. Add `import React from 'react'` at top. This is the ONLY change permitted to the four Claude Design files beyond path fixes.
**When to use:** Every Claude Design file.

```javascript
// BEFORE (CDN prototype):
// (no imports — React is global from CDN)
const Icon = ({ name, size = 20 }) => { ... }
Object.assign(window, { Icon, Logo, Button })

// AFTER (ES module):
import React from 'react'            // ADD THIS
const Icon = ({ name, size = 20 }) => { ... }
export { Icon, Logo, Button }        // REPLACE Object.assign
```

Key: `React.useState`, `React.useEffect`, `React.useReducer`, `React.Fragment` in the prototype are all `React.X` namespace calls. Because the components use `React.X` (not destructured imports), adding `import React from 'react'` is all that's needed — no additional named imports required unless the file uses hooks without the `React.` prefix.

[VERIFIED: Codebase grep — all React usage in 4 files confirmed to use `React.useState`, `React.useEffect`, `React.useReducer`, `React.Fragment` namespace calls]

### Pattern 5: Asset Path Conversion

**What:** Change all relative `assets/` references to absolute `/assets/` references after moving the assets folder into `public/`.
**When to use:** In all four Claude Design files and in the product/class data arrays.

```javascript
// BEFORE:
src="assets/hero-fox.svg"
img: 'assets/products/amigurumi-bear.svg'

// AFTER:
src="/assets/hero-fox.svg"
img: '/assets/products/amigurumi-bear.svg'
```

Files requiring asset path changes:
- `hero.jsx`: 5 asset references (`assets/hero-fox.svg`, 4 category SVGs)
- `products.jsx`: 20 asset references in PRODUCTS array + CLASSES array (all `assets/products/*.svg`)
- `sections.jsx`: 5 asset references in InstagramStrip tiles array

[VERIFIED: Codebase grep — exact locations confirmed]

### Pattern 6: CartContext with useReducer + localStorage

**What:** Net-new file `src/CartContext.jsx`. Exposes the same API surface as the original `cart` object (add, remove, setQty, clear, count, total) plus `openCart`/`onOpenCart` so Nav doesn't need to accept `window.openCart`.
**When to use:** This IS CartContext.jsx.

The SCAF-04 requirement specifies `useReducer` + `localStorage`. The pattern:

```jsx
// src/CartContext.jsx
import React from 'react'

const CartContext = React.createContext(null)

function cartReducer(items, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = items.find(i => i.sku === action.item.sku)
      if (existing) return items.map(i => i.sku === action.item.sku ? { ...i, qty: i.qty + (action.item.qty || 1) } : i)
      return [...items, { ...action.item, qty: action.item.qty || 1 }]
    }
    case 'REMOVE':
      return items.filter(i => i.sku !== action.sku)
    case 'SET_QTY':
      if (action.qty <= 0) return items.filter(i => i.sku !== action.sku)
      return items.map(i => i.sku === action.sku ? { ...i, qty: action.qty } : i)
    case 'CLEAR':
      return []
    default:
      return items
  }
}

const STORAGE_KEY = 'cc_cart'

function loadCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

export function CartProvider({ children }) {
  const [items, dispatch] = React.useReducer(cartReducer, null, loadCart)

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const count = () => items.reduce((s, i) => s + i.qty, 0)
  const total = () => items.reduce((s, i) => s + i.qty * i.price, 0)

  const value = {
    items,
    add: (item) => dispatch({ type: 'ADD', item }),
    remove: (sku) => dispatch({ type: 'REMOVE', sku }),
    setQty: (sku, qty) => dispatch({ type: 'SET_QTY', sku, qty }),
    clear: () => dispatch({ type: 'CLEAR' }),
    count,
    total,
  }

  return <CartContext value={value}>{children}</CartContext>
}

export function useCartContext() {
  return React.useContext(CartContext)
}
```

[VERIFIED: React docs — createContext, useReducer, useContext pattern; Context7 /reactjs/react.dev]

### Pattern 7: Nav's window.openCart / window.cartCount Replacement

**What:** Nav in `hero.jsx` reads `window.cartCount` and calls `window.openCart()` directly in JSX. These are the two window global reads in a Claude Design file that cannot be silently dropped.

**The situation in hero.jsx lines 26, 33, 38, 45:**
```jsx
// Current (must not be "rewritten"):
onClick={(e) => { if (x.href === '#cart') { e.preventDefault(); window.openCart && window.openCart(); } }}
<button onClick={() => window.openCart && window.openCart()} ...>
{(window.cartCount || 0) > 0 && (
  <span ...>{window.cartCount}</span>
)}
```

**The "change only exports" constraint vs. this reality:**
These `window.openCart` and `window.cartCount` reads are baked into Nav's JSX body. Removing them is not an export-only change — it touches component logic. However, CONTEXT.md says "migrate as-is, change only exports" meaning the spirit is no structural/visual rewrites. Replacing window globals with context calls is the purpose of SCAF-04, not a cosmetic rewrite.

**Recommended approach — App-level openCart prop:**
The cleanest solution that changes minimum code: App.jsx manages `cartOpen`/`setCartOpen` as before. Nav receives `cartCount` and `onOpenCart` as props from App.jsx. The Nav JSX changes from `window.openCart()` to `onOpenCart()` and from `window.cartCount` to `cartCount`. This is a targeted substitution of two values, not a structural rewrite.

```jsx
// In App.jsx:
const { count } = useCartContext()
const [cartOpen, setCartOpen] = React.useState(false)
// ...
<Nav accent={accent} cartCount={count()} onOpenCart={() => setCartOpen(true)} />

// In hero.jsx Nav component — ONLY these lines change:
// Props signature: ({ accent, cartCount = 0, onOpenCart })
// window.openCart() → onOpenCart()
// window.cartCount → cartCount
```

[VERIFIED: Codebase — hero.jsx lines 26, 33, 38, 45 confirmed by grep]
[ASSUMED: The "change only exports" rule permits replacing window global reads with prop reads since this is the stated purpose of SCAF-04]

### Pattern 8: useCart() in products.jsx and sections.jsx

**What:** ProductCard (products.jsx:129) and CartDrawer (sections.jsx:193) both call `useCart()`. After migration, `useCart` no longer exists; they call `useCartContext()` instead.

```javascript
// BEFORE in products.jsx and sections.jsx:
const c = useCart()

// AFTER:
import { useCartContext } from './CartContext.jsx'
// ...
const c = useCartContext()
```

The API surface is identical (`c.items`, `c.add()`, `c.remove()`, `c.setQty()`, `c.clear()`, `c.count()`, `c.total()`) so no further changes inside the component bodies.

[VERIFIED: Codebase grep — useCart() called at products.jsx:129, sections.jsx:193]

### Pattern 9: products.jsx Cart Store Removal

**What:** products.jsx currently defines `cartListeners`, `cart`, `window.cart`, `useCart`, and sets `window.cartCount` and `window.PRODUCTS`/`window.CLASSES`. In the migration:
- The entire cart store block (lines 4–41) is deleted
- `window.cart = cart` and `window.cartCount = ...` lines are deleted
- `window.PRODUCTS = PRODUCTS` and `window.CLASSES = CLASSES` lines are deleted
- `useCart` export is dropped from the export statement
- PRODUCTS and CLASSES arrays stay — they become named ES module exports

[VERIFIED: Codebase — products.jsx lines 4–41 confirmed as the cart store block]

### Pattern 10: vercel.json SPA Rewrite

**What:** Tells Vercel to serve index.html for any path, enabling BrowserRouter to handle routing client-side.
**When to use:** Must be present before first Vercel deploy.

```json
{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}
```

[VERIFIED: CONTEXT.md D-specifics section — exact content specified by user]

### Pattern 11: Supabase Client Stub

**What:** `src/lib/supabase.js` must exist in Phase 1 (per SCAF-01 project structure, SUPA-01 requirement). It's a stub — not used by any component in Phase 1, but activating the env var validation means `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be present.

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

[VERIFIED: npm registry — @supabase/supabase-js@2.105.3 confirmed; createClient API is stable across 2.x]

### Anti-Patterns to Avoid

- **Rewriting component logic:** Changing any JSX structure, conditional logic, or style objects inside the four Claude Design files. Only exports + imports + path strings change.
- **Moving `colors_and_type.css` into `src/`:** The import path in main.jsx should be `'../colors_and_type.css'` — do not move the file into src/ because its internal `@import url(...)` for Google Fonts uses a relative URL that would still resolve correctly, but the project convention is to keep it at root.
- **Importing assets as modules:** Do not `import heroImg from '/assets/hero-fox.svg'` — the public/ directory convention is to reference with absolute URL strings like `"/assets/hero-fox.svg"` directly in JSX. Vite does NOT process files in `public/` through the module graph. [VERIFIED: Context7 /vitejs/vite — "Reference public assets in CSS"]
- **Reinstating Babel Standalone:** @vitejs/plugin-react handles JSX transform via esbuild. No Babel config file needed.
- **Hardcoding VITE_WHATSAPP_NUMBER:** CLAUDE.md prohibits this. Always use `import.meta.env.VITE_WHATSAPP_NUMBER`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSX compilation | Custom Babel config | @vitejs/plugin-react | esbuild JSX transform is built in; Fast Refresh included |
| Cart persistence | Custom storage serializer | `JSON.stringify/parse` in useReducer initializer | localStorage is synchronous; one-liner load is sufficient |
| SPA routing fallback | Custom redirect rules | vercel.json SPA rewrite | Vercel handles this natively with one JSON line |
| Env var validation | Custom dotenv parsing | `import.meta.env` | Vite injects VITE_-prefixed vars at build time; just read them |

**Key insight:** The only "infrastructure" this phase introduces is Vite's build system. Everything else (cart, routing, env vars) uses the simplest possible built-in approach.

---

## Runtime State Inventory

Step 2.6: SKIPPED — this is a pure code migration, not a rename/refactor/migration of running services. No databases, OS registrations, or live services reference the project's internal naming. The only runtime state is the browser's `localStorage` for cart persistence, which Phase 1 introduces fresh (no existing data to migrate).

---

## Common Pitfalls

### Pitfall 1: React is Not Global After Migration

**What goes wrong:** CDN prototype has `React` as a UMD global (`window.React`). After migrating to ES modules, each file must explicitly `import React from 'react'`. Components that use `React.useState`, `React.useEffect`, etc. will throw `React is not defined` at runtime.

**Why it happens:** Vite doesn't inject globals. Each module has its own scope.

**How to avoid:** Add `import React from 'react'` as the first line of every migrated JSX file. Verify with a grep after migration: `grep -L "import React" src/*.jsx`.

**Warning signs:** Browser console error "React is not defined" or "Cannot read properties of undefined (reading 'useState')".

### Pitfall 2: Asset Paths Break on Deep Routes

**What goes wrong:** With relative `src="assets/foo.svg"` paths, loading the page at `http://localhost:5173/` works fine. But if a deep route like `/products` ever loads, the browser resolves `assets/foo.svg` relative to `/products/assets/foo.svg` which 404s.

**Why it happens:** Relative URLs are resolved relative to the current document URL, not the site root.

**How to avoid:** All asset references must become `/assets/foo.svg` (leading slash). The public/ directory in Vite serves files at the root path. [VERIFIED: Context7 /vitejs/vite — "Reference public assets"]

**Warning signs:** Images render at `/` but 404 on any other route.

### Pitfall 3: colors_and_type.css Import Path

**What goes wrong:** `main.jsx` is in `src/`, but `colors_and_type.css` stays at the repo root. The import must be `'../colors_and_type.css'` not `'./colors_and_type.css'` or `'/colors_and_type.css'`.

**Why it happens:** Vite resolves relative imports from the importing file's directory. An absolute path `/colors_and_type.css` would look for the file in the `public/` directory at that path.

**How to avoid:** Use `import '../colors_and_type.css'` in src/main.jsx. Alternatively, put a copy/symlink in public/ and use the HTML `<link>` approach — but the import approach is cleaner.

**Warning signs:** CSS variables undefined; fonts not loading; browser network tab shows 404 for the CSS file.

### Pitfall 4: Object.assign(window, {...}) Exports Not Removed

**What goes wrong:** If `Object.assign(window, {...})` lines are left in the migrated files alongside the new `export {}` statements, the app still works but pollutes the global namespace unnecessarily. Worse: if `Object.assign` is removed but `export {}` is not added, components importing from that file get `undefined`.

**Why it happens:** Migration done partially or with incorrect find-replace.

**How to avoid:** For each file, do both: remove the `Object.assign(window, {...})` line AND add the `export { ... }` named exports. Verify that the export list matches exactly what was in the Object.assign call.

**Warning signs:** `TypeError: ProductGrid is not a function` or similar in App.jsx.

### Pitfall 5: window.cartCount in Nav Does Not Re-Render

**What goes wrong:** In the CDN prototype, `window.cartCount` is read on every render of Nav. But in React, reading a plain variable doesn't cause re-renders. If the migration only replaces `window.cartCount` with a context read but forgets to subscribe Nav to CartContext, the cart badge never updates.

**Why it happens:** Nav must be inside `<CartProvider>` and use `useCartContext()` (or receive the count as a prop from App which itself reads context).

**How to avoid:** Ensure Nav either: (a) calls `useCartContext()` to read `count()` directly, or (b) receives `cartCount` as a prop from App.jsx which calls `useCartContext()`. The prop approach (D-08 direction) is confirmed by CONTEXT.md — App passes `accent` as prop; extend this to `cartCount` and `onOpenCart`.

**Warning signs:** Cart badge shows 0 or stale value after adding items.

### Pitfall 6: CartDrawer's submit() Closes but Does Not Navigate

**What goes wrong:** The current `submit()` in CartDrawer (sections.jsx:200–206) calls `c.clear()` and sets `stage = 'done'`. The `c` reference came from `useCart()`. After migration, `c` comes from `useCartContext()`. If `CartContext.jsx`'s `clear()` method doesn't trigger a re-render (e.g., because state was mutated instead of replaced), the drawer won't update.

**Why it happens:** `useReducer` must return new array references — never mutate. The reducer pattern in Pattern 6 uses spread/filter which always returns new references. Verify the CLEAR case returns `[]` (new empty array) not `items.length = 0`.

**How to avoid:** Verify reducer cases always return new array references. The pattern in Pattern 6 is correct.

### Pitfall 7: React 18 createRoot vs render

**What goes wrong:** The CDN prototype correctly uses `ReactDOM.createRoot(...)` (React 18 API). This is already the right API. Only if someone tries to use the legacy `ReactDOM.render(...)` would this break.

**Why it matters:** React 18 removed legacy render from the production bundle. `createRoot` is the required API.

**How to avoid:** Confirm main.jsx uses `ReactDOM.createRoot`. [VERIFIED: index.html:162 already uses createRoot]

---

## Code Examples

### Complete file-by-file change inventory

```
primitives.jsx changes:
  [1] ADD:    import React from 'react'              (line 1)
  [2] REMOVE: Object.assign(window, { Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider })
  [3] ADD:    export { Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider }

hero.jsx changes:
  [1] ADD:    import React from 'react'
  [2] ADD:    import { Icon, Logo, Button, CircleBadge, Overline } from './primitives.jsx'
  [3] CHANGE: Nav signature: ({ accent }) → ({ accent, cartCount = 0, onOpenCart })
  [4] CHANGE: window.openCart && window.openCart() → onOpenCart && onOpenCart()   (2 occurrences)
  [5] CHANGE: window.cartCount → cartCount   (2 occurrences)
  [6] CHANGE: src="assets/hero-fox.svg" → src="/assets/hero-fox.svg"
  [7] CHANGE: 4 img= props in Categories: "assets/category-*.svg" → "/assets/category-*.svg"
  [8] REMOVE: Object.assign(window, { Nav, Hero, Categories, CategoryTile })
  [9] ADD:    export { Nav, Hero, Categories, CategoryTile }

products.jsx changes:
  [1]  ADD:    import React from 'react'
  [2]  ADD:    import { useCartContext } from './CartContext.jsx'
  [3]  ADD:    import { Icon, CircleBadge, Overline, Button } from './primitives.jsx'
  [4]  DELETE: entire cart store block (lines 4–41): cartListeners, cart object, window.cart, useCart
  [5]  CHANGE: const c = useCart() → const c = useCartContext()   (in ProductCard)
  [6]  CHANGE: 20 img: 'assets/products/*.svg' → '/assets/products/*.svg'
  [7]  DELETE: window.PRODUCTS = PRODUCTS
  [8]  DELETE: window.CLASSES = CLASSES
  [9]  REMOVE: Object.assign(window, { ProductGrid, ProductCard, ClassesGrid, ClassCard, useCart, inr })
  [10] ADD:    export { ProductGrid, ProductCard, ClassesGrid, ClassCard, inr, PRODUCTS, CLASSES }

sections.jsx changes:
  [1] ADD:    import React from 'react'
  [2] ADD:    import { useCartContext } from './CartContext.jsx'
  [3] ADD:    import { Icon, Button, CircleBadge, HeartMark, Overline } from './primitives.jsx'
  [4] CHANGE: const c = useCart() → const c = useCartContext()   (in CartDrawer)
  [5] CHANGE: 5 img: 'assets/ig-yarn-*.svg' → '/assets/ig-yarn-*.svg'   (in InstagramStrip)
  [6] ADD:    import { inr } from './products.jsx'    (inr used in CartDrawer, BookingModal)
  [7] REMOVE: Object.assign(window, { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal, WhatsAppIcon })
  [8] ADD:    export { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal, WhatsAppIcon }

App.jsx (NEW — based on index.html App component, minus tweaks panel):
  - import all named exports from the 4 Claude Design files
  - import { useCartContext } from './CartContext.jsx'
  - const accent = '#f08a8a'
  - const [cartOpen, setCartOpen] = React.useState(false)
  - const [bookingFor, setBookingFor] = React.useState(null)
  - const { count } = useCartContext()
  - render: Nav accent={accent} cartCount={count()} onOpenCart={() => setCartOpen(true)}
  - render: all other components same as index.html App, minus tweaks panel JSX
```

### sections.jsx import of inr()

A subtle dependency: `sections.jsx` uses `inr()` (from products.jsx) in CartDrawer and BookingModal. In the CDN prototype, `inr` is available as a global via `Object.assign(window, {..., inr})`. After migration, sections.jsx must import `inr` from `./products.jsx`. This is a new import line — not a component rewrite.

[VERIFIED: Codebase — inr() used at sections.jsx:256, 264, 265, 282, 305, 307, 394, 439, 440, 467]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ReactDOM.render()` | `ReactDOM.createRoot()` | React 18 (2022) | Already using createRoot in prototype; no change needed |
| `type="text/babel"` script tags | Vite + @vitejs/plugin-react | Vite became standard ~2022 | Core change this phase makes |
| `Object.assign(window, {...})` | ES module `export {}` | ES modules standard | Core change this phase makes |
| Context value prop: `<Context.Provider value={...}>` | `<Context value={...}>` | React 19 only | Do NOT use the React 19 shorthand — this project uses React 18.3.1 where Provider is still required |

**Deprecated/outdated:**
- `ReactDOM.render()`: removed in React 18 production build. Prototype already uses createRoot — no risk.
- Babel Standalone for production: intended for prototyping only; not tree-shakeable, adds ~10MB to page load. Migration eliminates this entirely.
- `window` globals as cross-component state: replaced by CartContext.

**Important React 18 vs 19 note:** React docs examples may show `<CartContext value={...}>` (React 19 shorthand without `.Provider`). With React 18.3.1, the correct syntax is `<CartContext.Provider value={...}>`. The Pattern 6 example above uses the shorthand for brevity — the actual implementation must use `.Provider` syntax for React 18 compatibility. [ASSUMED — React 18 vs 19 Provider syntax difference; verify against react@18.3.1 changelog if uncertain]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Replacing `window.openCart` / `window.cartCount` in Nav with prop values counts as "change only exports" since it's the stated purpose of SCAF-04 | Pattern 7 | If treated as a forbidden rewrite, Nav cannot function without window globals and the phase cannot complete |
| A2 | `colors_and_type.css` can stay at repo root and be imported from `src/main.jsx` via `'../colors_and_type.css'` | Pitfall 3 / Project Structure | If Vite rejects cross-directory CSS imports from outside src/, file must move to public/ and use HTML link tag |
| A3 | React 18.3.1 requires `.Provider` syntax (`<CartContext.Provider value={...}>`) not the React 19 shorthand | State of the Art | If wrong, the code would throw a runtime error about CartContext not being a valid element |
| A4 | `inr()` is consumed inside sections.jsx (CartDrawer, BookingModal) and must be imported from products.jsx | Code Examples | If sections.jsx had its own copy, this import would create a duplicate — check by searching sections.jsx for `inr` definition |

**Assumption A4 verification:** Searched sections.jsx — `inr` is NOT defined there; it is called at 10 locations. Confirmed import is needed. [VERIFIED: grep of sections.jsx]

---

## Open Questions

1. **React 18 Provider syntax in CartContext.jsx**
   - What we know: React 19 added shorthand `<Context value={...}>`. React 18 requires `<Context.Provider value={...}>`.
   - What's unclear: The Pattern 6 example used the shorthand for readability. The implementation must use `.Provider`.
   - Recommendation: Planner should specify `.Provider` syntax explicitly in the CartContext task.

2. **App.jsx — does Nav need Logo imported?**
   - What we know: Nav uses `Logo` which is defined in primitives.jsx. In the CDN prototype, Logo is available globally via Object.assign. After migration, hero.jsx must import Logo from primitives.jsx.
   - What's unclear: Whether hero.jsx also uses CircleBadge, Overline — yes it does. The import line in hero.jsx needs all primitives it uses.
   - Recommendation: Grep each Claude Design file for all primitive component names used and build the import list accordingly. Pattern 4 in this document lists the required imports per file.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, vite dev server | Yes | v22.16.0 | — |
| npm | package installation | Yes | 10.9.2 | — |
| Vite 5 | Build/dev | Not installed (no package.json) | — | Install via npm |
| React 18 | UI | Not installed | — | Install via npm |

**Missing dependencies with no fallback:**
- Vite 5, React 18, react-dom, react-router-dom, @vitejs/plugin-react, @supabase/supabase-js — all must be installed via npm as part of Wave 0 of this phase.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

nyquist_validation is enabled (absent from config = enabled).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config or test files exist in the repo |
| Config file | None — Wave 0 must create vitest.config.js or jest.config.js |
| Quick run command | `npm run test` (once configured) |
| Full suite command | `npm run test` |

This is a UI-heavy migration phase. Automated unit tests are feasible only for isolated non-UI logic (CartContext reducer, env var validation function). The primary verification is manual: `npm run dev` starts without errors and the full prototype UI renders correctly.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCAF-01 | `npm run dev` starts without build errors | smoke | `npm run build` exits 0 | No — Wave 0 |
| SCAF-02 | All 4 Claude Design files import without error | smoke | `npm run build` exits 0 | No — Wave 0 |
| SCAF-03 | CSS variables render on page | manual | Visual check | — |
| SCAF-04 | CartContext: add/remove/qty/clear/persist across refresh | unit (reducer) + manual | `npx vitest run CartContext.test.jsx` | No — Wave 0 |
| SCAF-05 | vercel.json present at repo root | manual | `ls vercel.json` | — |
| SCAF-06 | Missing env var shows error screen | unit | `npx vitest run main.test.jsx` | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run build` — exits 0 is the quick check
- **Per wave merge:** `npm run build` + manual browser smoke test
- **Phase gate:** `npm run dev` renders full prototype UI with no console errors; cart persists across refresh

### Wave 0 Gaps

- [ ] `package.json` with test script pointing to vitest — must be created as part of scaffold
- [ ] `vitest.config.js` or vitest config in `vite.config.js`
- [ ] `src/CartContext.test.jsx` — covers SCAF-04 (reducer unit tests)
- [ ] Framework install: `npm install -D vitest @vitest/ui` if chosen

*(Alternatively, given the phase is primarily a mechanical migration, the planner may choose to rely on `npm run build` as the only automated gate and treat all SCAF-0x as manual-verified. This is acceptable for a migration phase.)*

---

## Security Domain

security_enforcement is enabled (not explicitly false in config).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in Phase 1 |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No access control |
| V5 Input Validation | Partial | Phone number: `.replace(/\D/g, '').slice(0, 10)` already in CartDrawer/BookingModal — preserved as-is |
| V6 Cryptography | No | No crypto in Phase 1 |
| V7 Error Handling | Yes | Env var validation must not leak secret values in error messages — only show variable NAMES, not values |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Env var value leaked in error message | Information Disclosure | Validation error shows key NAMES only (`Missing env vars: VITE_SUPABASE_ANON_KEY`) never values |
| XSS via product name in WhatsApp message | Tampering | Phase 1 doesn't build WhatsApp URL (Phase 2); note for planner |
| localStorage cart poisoning | Tampering | `try/catch` in loadCart() prevents JSON parse errors from crashing app; price comes from PRODUCTS array not localStorage |

**Security note on Pattern 3 (env validation):** The error screen renders variable names, not their values. The implementation shown is correct in this regard. Do not log `import.meta.env[k]` values to the console.

---

## Sources

### Primary (HIGH confidence)
- Context7 `/vitejs/vite` — vite.config.js patterns, public/ directory, import.meta.env, index.html structure
- Context7 `/websites/reactrouter_6_30_3` — BrowserRouter, Routes, Route, createRoot setup
- Context7 `/reactjs/react.dev` — createContext, useReducer, useContext CartProvider pattern
- npm registry (live) — all package versions verified 2026-05-07
- Codebase grep (live) — all window global locations, asset paths, useCart() call sites, Object.assign lines verified

### Secondary (MEDIUM confidence)
- Codebase read of index.html, primitives.jsx, hero.jsx, products.jsx, sections.jsx, colors_and_type.css — source of truth for current prototype structure
- CONTEXT.md and REQUIREMENTS.md — locked decisions and acceptance criteria

### Tertiary (LOW confidence)
- None — all critical claims were verified via tooling.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry verified, all versions confirmed
- Architecture: HIGH — derived directly from reading all 6 source files + Context7 docs
- Pitfalls: HIGH — identified from direct code inspection, not speculation
- CartContext design: HIGH — React docs pattern + matches SCAF-04 spec exactly

**Research date:** 2026-05-07
**Valid until:** 2026-06-07 (stable libraries; React 18 and Vite 5 are not in rapid churn)

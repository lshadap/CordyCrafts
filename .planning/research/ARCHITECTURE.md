# Architecture Patterns

**Project:** Cordy's Crafts — Vite 5 + React + Supabase SPA
**Researched:** 2026-05-06
**Confidence:** HIGH (based on confirmed React Router v6 docs, training knowledge of Vite 5 and Supabase JS client patterns, and direct reading of prototype source)

---

## Recommended src/ Folder Layout

This is the concrete structure for the migrated Vite project. The prototype files stay at
the repo root (untouched). All new Vite source lives under `src/`.

```
CordyCrafts/                        ← repo root (prototype files stay here, untouched)
├── index.html                      ← Vite entry HTML (replaces prototype index.html in dev/build)
├── vite.config.js
├── vercel.json                     ← SPA rewrite: all paths → /index.html
├── .env.example
├── .env.local
│
├── src/
│   ├── main.jsx                    ← createRoot + RouterProvider
│   ├── router.jsx                  ← createBrowserRouter route config
│   │
│   ├── lib/
│   │   └── supabase.js             ← ONLY place createClient is called (CLAUDE.md rule)
│   │
│   ├── context/
│   │   └── CartContext.jsx         ← CartProvider + useCart hook (replaces window.cart)
│   │
│   ├── hooks/
│   │   ├── useProducts.js          ← Supabase fetch: products table
│   │   └── useClasses.js           ← Supabase fetch: classes table
│   │
│   ├── pages/
│   │   ├── HomePage.jsx            ← Full single-page layout (Hero → Products → Classes → About → Footer)
│   │   ├── ProductsPage.jsx        ← /products — filtered product catalog (optional, Phase 2+)
│   │   └── ClassesPage.jsx         ← /classes — class listing (optional, Phase 2+)
│   │
│   ├── components/
│   │   ├── primitives.jsx          ← Migrated from prototype (Icon, Logo, Button, CircleBadge, etc.)
│   │   ├── hero.jsx                ← Migrated from prototype (Nav, Hero)
│   │   ├── products.jsx            ← Migrated from prototype (ProductGrid, ProductCard, ClassesGrid, ClassCard)
│   │   └── sections.jsx            ← Migrated from prototype (About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal)
│   │
│   └── assets/                     ← Symlink or copy of /assets/ at build time
│                                      (Vite resolves /assets/ from repo root by default via publicDir)
│
├── assets/                         ← SVGs stay here (DO NOT move — CLAUDE.md constraint)
│   ├── hero-fox.svg
│   ├── maker-portrait.svg
│   ├── category-*.svg
│   ├── cordys-logo.png
│   ├── ig-yarn-*.svg
│   └── products/
│       └── *.svg
│
├── colors_and_type.css             ← Stays at root; imported in src/main.jsx
├── primitives.jsx                  ← Prototype (keep; do not delete until migration verified)
├── hero.jsx                        ← Prototype (keep)
├── products.jsx                    ← Prototype (keep)
└── sections.jsx                    ← Prototype (keep)
```

**Key layout decisions:**

- `assets/` stays at the repo root. Vite's `publicDir` defaults to `public/` but can be pointed at
  `assets/` via `vite.config.js` (`publicDir: '../assets'` if vite.config is at root, or `publicDir: 'assets'`).
  This means `<img src="/assets/products/scarf.svg">` continues to work unchanged in migrated components.
- `colors_and_type.css` stays at the repo root; import it once in `src/main.jsx` with
  `import '../colors_and_type.css'`.
- Prototype `.jsx` files stay at root during migration so the prototype `index.html` still
  loads in a browser for visual comparison. Delete them after migration is verified.

---

## Window Global Migration Strategy

The prototype exports everything to `window` because it has no module system:

```js
// prototype pattern (to be eliminated)
Object.assign(window, { ProductGrid, ProductCard, ... });
window.cart = cart;
window.cartCount = cart.count();
window.openCart = () => setDrawerOpen(true);
```

### Replacement Map

| Prototype global | Vite replacement | Location |
|-----------------|-----------------|----------|
| `window.cart` | `useCart()` hook via `CartContext` | `src/context/CartContext.jsx` |
| `window.cartCount` | `cart.count` from `useCart()` | consumed in Nav component |
| `window.openCart()` | `cart.openDrawer()` or a separate `useCartDrawer()` | `CartContext` or local state lifted to App |
| `window.PRODUCTS` | removed — fetched from Supabase via `useProducts()` | `src/hooks/useProducts.js` |
| `window.CLASSES` | removed — fetched from Supabase via `useClasses()` | `src/hooks/useClasses.js` |
| `window.TWEAKS` | removed — tweaks panel is prototype-only, not needed in production | delete entirely |
| `Object.assign(window, {...})` | ES module exports (`export function X`) | each component file |

### Migration Order

Phase 1 (scaffolding) removes `window.*` dependencies in this order because of the dependency graph:

1. Convert `primitives.jsx` first — no dependencies on other prototype files
2. Convert `hero.jsx` — depends only on primitives
3. Convert `products.jsx` — depends on primitives; remove PRODUCTS/CLASSES arrays; wire `useCart` from context
4. Convert `sections.jsx` — depends on primitives + products; wire `useCart`; wire `useProducts`/`useClasses`
5. Wire `CartContext` so CartDrawer and Nav both see the same cart state
6. Wire `useProducts` / `useClasses` hooks so grids render from Supabase

---

## Supabase Client Pattern

### `src/lib/supabase.js`

```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

This is the **only file** that calls `createClient`. All hooks and mutations import `supabase`
from this module. This satisfies the CLAUDE.md constraint ("Supabase client lives only in
`src/lib/supabase.js` — never initialised elsewhere").

---

## Supabase Data Fetching — Hook Patterns

Use custom `useEffect` hooks for data fetching. Do NOT use a data-fetching library (no TanStack
Query, SWR) in v1 — the site has exactly two read-only data sets and no cache invalidation
complexity. Plain `useEffect` + `useState` is sufficient and keeps the bundle small.

### `src/hooks/useProducts.js`

```js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (cancelled) return;
      if (error) { setError(error); setLoading(false); return; }
      setProducts(data);
      setLoading(false);
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}
```

### `src/hooks/useClasses.js`

Identical shape, pointing at the `classes` table:

```js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useClasses() {
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('active', true)
        .order('date_start');

      if (cancelled) return;
      if (error) { setError(error); setLoading(false); return; }
      setClasses(data);
      setLoading(false);
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { classes, loading, error };
}
```

**Why hooks, not server functions:**  
This is a pure SPA on Vercel with no server runtime (no Remix, no Next.js). Supabase is queried
directly from the browser using the anon key with Row Level Security (RLS). Server functions
would require a serverless function layer that adds complexity and cold-start latency for no
security benefit on public read-only product data.

**Cancellation:** The `cancelled` flag prevents `setState` after unmount. This is the correct
React 18 pattern for async effects without an AbortController (Supabase JS client does not
expose AbortSignal on queries in v2).

**Skeleton states:** `loading: true` on mount gives components a predictable flag to render
skeleton cards before data arrives. This satisfies the "Loading skeleton states for product
and class grids" requirement from PROJECT.md.

---

## Cart Context + localStorage Persistence

Replace `window.cart` (pub-sub singleton) with React Context. Context is the correct choice
here: the cart needs to be visible to Nav (badge count), CartDrawer (line items), and
ProductCard (add button feedback). Prop drilling to all three would be unpleasant. A dedicated
state management library (Zustand, Redux) is overkill for a cart with 5 operations.

### `src/context/CartContext.jsx`

```jsx
import { createContext, useContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'cc-cart';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function cartReducer(items, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = items.find(i => i.sku === action.item.sku);
      if (existing) {
        return items.map(i =>
          i.sku === action.item.sku ? { ...i, qty: i.qty + (action.item.qty || 1) } : i
        );
      }
      return [...items, { ...action.item, qty: action.item.qty || 1 }];
    }
    case 'SET_QTY': {
      if (action.qty <= 0) return items.filter(i => i.sku !== action.sku);
      return items.map(i => i.sku === action.sku ? { ...i, qty: action.qty } : i);
    }
    case 'REMOVE':
      return items.filter(i => i.sku !== action.sku);
    case 'CLEAR':
      return [];
    case 'INIT':
      return action.items;
    default:
      return items;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], load);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const cart = {
    items,
    add:    (item) => dispatch({ type: 'ADD', item }),
    setQty: (sku, qty) => dispatch({ type: 'SET_QTY', sku, qty }),
    remove: (sku) => dispatch({ type: 'REMOVE', sku }),
    clear:  () => dispatch({ type: 'CLEAR' }),
    count:  items.reduce((s, i) => s + i.qty, 0),
    total:  items.reduce((s, i) => s + i.qty * i.price, 0),
  };

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
```

**Key decisions:**

- `useReducer` instead of `useState` — cart operations are pure functions of previous state,
  which makes reducer the natural fit. Eliminates stale-closure bugs that affect `useState`
  with arrays.
- `localStorage` written in a `useEffect` — synchronous localStorage writes in the reducer
  would cause issues with React 18 concurrent mode. Effect-based writes are safe.
- Initial state from `localStorage` passed as the third `init` argument to `useReducer` —
  this avoids re-reading localStorage on every render.
- `count` and `total` are derived values (not stored state) — computed from `items` on every
  render. For a cart that rarely exceeds 10 items, this is negligible and avoids sync bugs.
- Cart drawer open/close state is NOT in CartContext — it is local state in the component
  that owns the drawer (the root layout or HomePage). CartContext is data-only. This keeps
  the context focused and avoids unnecessary re-renders of the whole tree when the drawer opens.

---

## React Router v6 Route Config

This site is almost entirely a single scrolling page. React Router is needed for:
1. `/` — main page
2. `/products` (optional, Phase 2) — deep-link to product category
3. `/classes` (optional, Phase 2) — deep-link to classes page
4. 404 catch-all — important for Vercel SPA routing

Use `createBrowserRouter` + `RouterProvider` (v6 data API pattern, confirmed from React Router
v6.30.1 docs). Do NOT use the older `<BrowserRouter>` + `<Routes>` pattern — `createBrowserRouter`
is the recommended approach as of v6.4+ and supports loaders/error elements cleanly.

### `src/router.jsx`

```jsx
import { createBrowserRouter } from 'react-router-dom';
import { HomePage }    from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />,
  },
  // Phase 2 additions (add when building separate pages):
  // { path: '/products', element: <ProductsPage /> },
  // { path: '/classes',  element: <ClassesPage />  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```

### `src/main.jsx`

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { router } from './router';
import '../colors_and_type.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </React.StrictMode>
);
```

**Why `CartProvider` wraps `RouterProvider`:** The cart must be accessible to both the Nav
(inside HomePage) and CartDrawer (also inside HomePage). If the router were outside CartProvider,
any future route that needs cart access would also be covered.

### `vercel.json` — SPA routing fallback

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This is required so that direct navigation to `/products` or `/classes` (Phase 2) does not
return a 404 from Vercel. Every path returns `index.html` and React Router handles routing
client-side.

---

## Component Boundaries After Migration

| Component | File after migration | Depends on | Exports |
|-----------|---------------------|------------|---------|
| Icon, Logo, Button, CircleBadge, Overline, StitchDivider | `src/components/primitives.jsx` | nothing | named exports |
| Nav, Hero | `src/components/hero.jsx` | primitives, `useCart` | named exports |
| ProductGrid, ProductCard, ClassesGrid, ClassCard | `src/components/products.jsx` | primitives, `useCart`, `useProducts`, `useClasses` | named exports |
| About, Newsletter, InstagramStrip, Footer | `src/components/sections.jsx` | primitives | named exports |
| CartDrawer | `src/components/sections.jsx` | primitives, `useCart` | named export |
| BookingModal | `src/components/sections.jsx` | primitives | named export |
| CartProvider, useCart | `src/context/CartContext.jsx` | React only | named exports |
| supabase | `src/lib/supabase.js` | @supabase/supabase-js | named export |
| useProducts | `src/hooks/useProducts.js` | supabase | named export |
| useClasses | `src/hooks/useClasses.js` | supabase | named export |
| HomePage | `src/pages/HomePage.jsx` | all components | default export |

**No `Object.assign(window, {...})` anywhere in migrated files.** ES module imports replace all
window globals.

---

## Data Flow After Migration

```
supabase (src/lib/supabase.js)
  ↓
useProducts() / useClasses() (src/hooks/)
  ↓ { products, loading, error }
ProductGrid / ClassesGrid (src/components/products.jsx)
  ↓ renders ProductCard / ClassCard

CartContext (src/context/CartContext.jsx)
  ├── Nav reads cart.count
  ├── ProductCard calls cart.add()
  └── CartDrawer reads cart.items, calls cart.setQty / cart.remove / cart.clear

Supabase writes (inside CartDrawer / BookingModal on form submit):
  supabase.from('orders').insert({...})
  supabase.from('bookings').insert({...})
  → then open WhatsApp wa.me link
```

---

## Scalability Considerations

| Concern | Now (launch) | Future |
|---------|-------------|--------|
| Product catalog size | ~12 items, single fetch on mount | If catalog grows to 100+, add `.range()` pagination or category-filtered queries |
| Cart persistence | localStorage on device | No backend cart needed until user accounts exist (out of scope v1) |
| Supabase RLS | Public read on products/classes, public insert on orders/bookings | Tighten insert rules once spam is observed |
| Image delivery | SVGs from public dir | When real product photos added, use Supabase Storage + CDN URLs stored in product row |
| SEO | Client-rendered only | Sufficient for v1; if Google indexing becomes important, consider static pre-rendering via vite-plugin-ssr or a Vercel Edge Function |

---

## Anti-Patterns to Avoid

### Calling createClient Outside src/lib/supabase.js
**What goes wrong:** Multiple GoTrue auth listeners, multiple connection pools, inconsistent
auth state across the app.
**Prevention:** The CLAUDE.md rule exists for this reason. Import `supabase` from `src/lib/supabase.js`
everywhere else.

### Storing Derived Cart Values in State
**What goes wrong:** `cartTotal` and `cartCount` stored separately from `items` get out of sync
on edge cases (qty set to 0, item removed).
**Prevention:** Compute them from `items` on every render. For a sub-20-item cart this is
microseconds.

### window.openCart() Pattern
**What goes wrong:** CartDrawer open state becomes globally mutable. Any component can open
the cart, making it hard to trace render source.
**Prevention:** Lift CartDrawer open state to `HomePage`. Pass `onOpen` prop to Nav and
`ProductCard` "View Cart" buttons. If this gets cumbersome across many components, add
`drawerOpen / setDrawerOpen` to CartContext (acceptable expansion).

### Fetching Products Inside Individual Product Cards
**What goes wrong:** N+1 fetches, waterfall loading, each card mounted independently hitting Supabase.
**Prevention:** Fetch once in `useProducts()` at the grid level. Pass individual product as a
prop to `ProductCard`. This is already the prototype's pattern and must be preserved.

### Hardcoding VITE_WHATSAPP_NUMBER
**What goes wrong:** Number changes require a code deploy instead of an env var update.
**Prevention:** Always `import.meta.env.VITE_WHATSAPP_NUMBER`. Never string literal.

---

## Sources

- React Router v6.30.1 docs: https://reactrouter.com/6.30.1/start/overview (fetched 2026-05-06, HIGH confidence)
- Supabase JS client initialization and query patterns: training knowledge corroborated by documented project constraints in `.planning/PROJECT.md` and `.env.example` (MEDIUM confidence — unable to fetch supabase.com docs due to tool restriction; patterns are stable and consistent across v2 releases)
- Vite 5 `publicDir` and `import.meta.env` patterns: training knowledge (HIGH confidence — these APIs have been stable since Vite 2)
- React Context + useReducer patterns: React 18 official patterns (HIGH confidence)
- Prototype source analysis: direct reading of `products.jsx`, `sections.jsx`, `hero.jsx`, `primitives.jsx`, `index.html` (HIGH confidence — first-party source)

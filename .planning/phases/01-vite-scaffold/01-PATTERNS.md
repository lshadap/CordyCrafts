# Phase 1: Vite Scaffold - Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 14 (new/modified files from CONTEXT.md)
**Analogs found:** 10 / 14 (4 have no prior analog — they are new infrastructure files)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | config | — | none | no analog |
| `vite.config.js` | config | — | none | no analog |
| `index.html` | config | — | `index.html` (current) | exact (modify in-place) |
| `src/main.jsx` | provider/entry | request-response | `index.html` lines 162 + 85-116 | role-match |
| `src/App.jsx` | component | request-response | `index.html` lines 85-160 (App component) | exact |
| `src/CartContext.jsx` | provider/store | event-driven | `products.jsx` lines 3-41 (cart store + useCart) | role-match |
| `src/lib/supabase.js` | utility/config | — | none | no analog |
| `src/primitives.jsx` | component | — | `primitives.jsx` (current) | exact (migrate) |
| `src/hero.jsx` | component | request-response | `hero.jsx` (current) | exact (migrate) |
| `src/products.jsx` | component/store | CRUD | `products.jsx` (current) | exact (migrate) |
| `src/sections.jsx` | component | request-response | `sections.jsx` (current) | exact (migrate) |
| `public/assets/` | static | file-I/O | `assets/` (current) | exact (move) |
| `vercel.json` | config | — | none | no analog |
| `.env.example` | config | — | none | no analog |

---

## Pattern Assignments

### `index.html` (modify — Vite entry point)

**Analog:** `index.html` (current file, lines 1-6 and 50-56)

**What changes:** Remove the three CDN `<script>` tags (React, ReactDOM, Babel). Remove the four `<script type="text/babel" src="...">` tags. Remove the inline `<script type="text/babel">` App block. Remove the tweaks panel `<style>` block (lines 7-49). Remove the `window.TWEAKS` script block (lines 57-63). Add a single module script tag pointing to `src/main.jsx`.

**Keep as-is** (lines 1-6):
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Cordy's Crafts · Hand-made with love</title>
<link rel="stylesheet" href="colors_and_type.css">
```

**Remove entirely** (lines 7-49): The `<style>` block for tweaks panel.

**Remove entirely** (lines 50-52): CDN script tags for React, ReactDOM, Babel.

**Keep** (line 55): `<div id="root"></div>`

**Remove entirely** (lines 57-63, 65-68, 70-163): `window.TWEAKS`, babel script tags, inline App babel block.

**Replace the removed scripts with** (new lines after `<div id="root">`):
```html
<script type="module" src="/src/main.jsx"></script>
```

**Final index.html structure:**
```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Cordy's Crafts · Hand-made with love</title>
<link rel="stylesheet" href="colors_and_type.css">
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

### `src/main.jsx` (new — entry point)

**Analog:** `index.html` lines 162 (createRoot call) and lines 85-116 (App state + effects)

**Source pattern — createRoot** (`index.html` line 162):
```jsx
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
```

**Source pattern — env vars** (no existing analog; from RESEARCH.md Pattern 3):
The codebase has no env var validation today (CDN prototype reads nothing from env). New pattern for `main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '../colors_and_type.css'
import { CartProvider } from './CartContext.jsx'
import App from './App.jsx'

const REQUIRED_VARS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_WHATSAPP_NUMBER']
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

**Key constraints:**
- Error display shows only variable NAMES, never values (RESEARCH.md security note)
- CSS import path is `'../colors_and_type.css'` (one level up from `src/`) — file stays at repo root
- `CartProvider` is the named export from `CartContext.jsx` (not default export)

---

### `src/App.jsx` (new — root component)

**Analog:** `index.html` lines 85-160 (the inline `App` component, minus tweaks panel)

**Full source to extract from** (`index.html` lines 85-160):

**State pattern** (lines 111-115):
```jsx
const [cartOpen, setCartOpen] = React.useState(false);
const [bookingFor, setBookingFor] = React.useState(null);
React.useEffect(() => {
  window.openCart = () => setCartOpen(true);
}, []);
```

**What changes in App.jsx vs. the prototype:**
- Remove `tweaks`/`panel` state (lines 86-87) — no tweaks panel
- Remove `useEffect` for edit-mode protocol (lines 89-98) — dropped per D-06
- Remove `setKey` function (lines 100-106) — dropped per D-06
- Remove `accent = ACCENTS[tweaks.accent]` (line 108) — replaced by hardcoded value
- Remove `copy = HEADLINES[tweaks.headline]` (line 109) — replaced by hardcoded strings
- Remove `window.openCart` useEffect (lines 113-115) — replaced by CartContext
- Remove tweaks panel JSX (lines 131-157) — dropped per D-06
- Add `import { useCartContext } from './CartContext.jsx'`
- Add `const { count } = useCartContext()`

**Resulting App.jsx core pattern:**
```jsx
import React from 'react'
import { Nav, Hero, Categories } from './hero.jsx'
import { ProductGrid, ClassesGrid } from './products.jsx'
import { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal } from './sections.jsx'
import { useCartContext } from './CartContext.jsx'

const App = () => {
  const accent = '#f08a8a'
  const h = "Hand-made,\nwith love."
  const s = "A little studio of three crafts — paper, candles, and polymer clay — all small-batch, all made by hand at the same kitchen table."

  const { count } = useCartContext()
  const [cartOpen, setCartOpen] = React.useState(false)
  const [bookingFor, setBookingFor] = React.useState(null)

  return (
    <React.Fragment>
      <Nav accent={accent} cartCount={count()} onOpenCart={() => setCartOpen(true)}/>
      <Hero headline={h} sub={s} accent={accent}/>
      <Categories accent={accent}/>
      <ProductGrid accent={accent}/>
      <ClassesGrid accent={accent} onBook={setBookingFor}/>
      <About accent={accent}/>
      <Newsletter accent={accent}/>
      <InstagramStrip/>
      <Footer/>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} accent={accent}/>
      <BookingModal klass={bookingFor} onClose={() => setBookingFor(null)} accent={accent}/>
    </React.Fragment>
  )
}

export default App
```

---

### `src/CartContext.jsx` (new — cart provider)

**Analog:** `products.jsx` lines 3-41 (cart store + useCart hook)

**Source pattern — original cart store API** (`products.jsx` lines 5-31):
```javascript
const cart = {
  items: [], // { sku, name, price, img, qty, cat }
  add(item) {
    const existing = this.items.find(i => i.sku === item.sku);
    if (existing) existing.qty += item.qty || 1;
    else this.items.push({ ...item, qty: item.qty || 1 });
    this._notify();
  },
  setQty(sku, qty) {
    const it = this.items.find(i => i.sku === sku);
    if (!it) return;
    if (qty <= 0) this.items = this.items.filter(i => i.sku !== sku);
    else it.qty = qty;
    this._notify();
  },
  remove(sku) {
    this.items = this.items.filter(i => i.sku !== sku);
    this._notify();
  },
  clear() { this.items = []; this._notify(); },
  count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  total() { return this.items.reduce((s, i) => s + i.qty * i.price, 0); },
```

**Source pattern — original useCart hook** (`products.jsx` lines 34-41):
```javascript
const useCart = () => {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    cartListeners.add(force);
    return () => cartListeners.delete(force);
  }, []);
  return cart;
};
```

**CartContext.jsx must expose the identical API surface** so `CartDrawer` (`sections.jsx` line 193: `const c = useCart()`) and `ProductCard` (`products.jsx` line 129: `const c = useCart()`) work with only a call-site swap from `useCart()` to `useCartContext()`.

**CartContext.jsx implementation** (useReducer + localStorage, React 18 `.Provider` syntax):
```jsx
import React from 'react'

const CartContext = React.createContext(null)

function cartReducer(items, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = items.find(i => i.sku === action.item.sku)
      if (existing) return items.map(i =>
        i.sku === action.item.sku ? { ...i, qty: i.qty + (action.item.qty || 1) } : i
      )
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartContext() {
  return React.useContext(CartContext)
}
```

**React 18 note:** Use `<CartContext.Provider value={value}>` NOT `<CartContext value={value}>` — the shorthand without `.Provider` is React 19 only. This project uses React 18.3.1.

---

### `src/primitives.jsx` (migrate — exports only)

**Analog:** `primitives.jsx` (full file, 124 lines — read above)

**Only two changes allowed:**

**Change 1 — Add import at line 1** (new):
```javascript
import React from 'react'
```

**Change 2 — Replace last line** (`primitives.jsx` line 124):
```javascript
// REMOVE:
Object.assign(window, { Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider });

// ADD:
export { Icon, Logo, HeartMark, Button, CircleBadge, Overline, StitchDivider }
```

All component bodies (lines 3-122) are untouched. No other changes.

---

### `src/hero.jsx` (migrate — imports, exports, window globals, asset paths)

**Analog:** `hero.jsx` (full file, 216 lines — read above)

**Change 1 — Add imports at top** (new lines 1-2):
```javascript
import React from 'react'
import { Icon, Logo, Button, CircleBadge, Overline } from './primitives.jsx'
```

**Change 2 — Nav props signature** (`hero.jsx` line 3):
```jsx
// BEFORE:
const Nav = ({ accent }) => (

// AFTER:
const Nav = ({ accent, cartCount = 0, onOpenCart }) => (
```

**Change 3 — window.openCart references** (`hero.jsx` lines 26 and 33):
```jsx
// BEFORE (line 26):
onClick={(e) => { if (x.href === '#cart') { e.preventDefault(); window.openCart && window.openCart(); } }}

// AFTER:
onClick={(e) => { if (x.href === '#cart') { e.preventDefault(); onOpenCart && onOpenCart(); } }}

// BEFORE (line 33):
<button onClick={() => window.openCart && window.openCart()} ...>

// AFTER:
<button onClick={() => onOpenCart && onOpenCart()} ...>
```

**Change 4 — window.cartCount references** (`hero.jsx` lines 38 and 45):
```jsx
// BEFORE (line 38):
{(window.cartCount || 0) > 0 && (

// AFTER:
{(cartCount || 0) > 0 && (

// BEFORE (line 45):
}}>{window.cartCount}</span>

// AFTER:
}}>{cartCount}</span>
```

**Change 5 — Asset paths** (`hero.jsx` lines 129, 209-212):
```jsx
// BEFORE (line 129):
<img src="assets/hero-fox.svg" ...

// AFTER:
<img src="/assets/hero-fox.svg" ...

// BEFORE (lines 209-212, CategoryTile usages in Categories):
img="assets/category-amigurumi.svg"
img="assets/category-bags.svg"
img="assets/category-wearables.svg"
img="assets/category-classes.svg"

// AFTER:
img="/assets/category-amigurumi.svg"
img="/assets/category-bags.svg"
img="/assets/category-wearables.svg"
img="/assets/category-classes.svg"
```

**Change 6 — Replace last line** (`hero.jsx` line 216):
```javascript
// REMOVE:
Object.assign(window, { Nav, Hero, Categories, CategoryTile });

// ADD:
export { Nav, Hero, Categories, CategoryTile }
```

---

### `src/products.jsx` (migrate — delete cart store, add imports, change exports, update asset paths)

**Analog:** `products.jsx` (full file, 351 lines — read above)

**Change 1 — Add imports at top** (new lines 1-3):
```javascript
import React from 'react'
import { useCartContext } from './CartContext.jsx'
import { Icon, CircleBadge, Overline, Button } from './primitives.jsx'
```

**Change 2 — Delete entire cart store block** (`products.jsx` lines 3-41):
```javascript
// DELETE ENTIRELY (lines 3-41):
const cartListeners = new Set();
const cart = { ... };
window.cart = cart;
const useCart = () => { ... };
```

**Change 3 — Delete window assignments for data** (`products.jsx` lines 124-125):
```javascript
// DELETE BOTH:
window.PRODUCTS = PRODUCTS;
window.CLASSES = CLASSES;
```

**Change 4 — Swap useCart call in ProductCard** (`products.jsx` line 129):
```javascript
// BEFORE:
const c = useCart();

// AFTER:
const c = useCartContext();
```

**Change 5 — Asset paths in PRODUCTS array** (`products.jsx` lines 48-61, all `img:` fields):
```javascript
// BEFORE (example):
img: 'assets/products/amigurumi-bear.svg'

// AFTER:
img: '/assets/products/amigurumi-bear.svg'
```
Apply to all 12 PRODUCTS entries and all 8 CLASSES entries (20 total `img:` values in data arrays at lines 48-121).

**Change 6 — Replace last line** (`products.jsx` line 351):
```javascript
// REMOVE:
Object.assign(window, { ProductGrid, ProductCard, ClassesGrid, ClassCard, useCart, inr });

// ADD (note: useCart dropped, PRODUCTS and CLASSES added):
export { ProductGrid, ProductCard, ClassesGrid, ClassCard, inr, PRODUCTS, CLASSES }
```

---

### `src/sections.jsx` (migrate — add imports, swap useCart, update asset paths, change export)

**Analog:** `sections.jsx` (full file, 507 lines — read above)

**Change 1 — Add imports at top** (new lines 1-4):
```javascript
import React from 'react'
import { useCartContext } from './CartContext.jsx'
import { Icon, Button, CircleBadge, HeartMark, Overline } from './primitives.jsx'
import { inr } from './products.jsx'
```

Note: `inr` is called at sections.jsx lines 256, 264, 265, 282, 305, 307, 394, 439, 440, 467. In the CDN prototype it was a global via `window`. After migration it must be imported.

**Change 2 — Swap useCart call in CartDrawer** (`sections.jsx` line 193):
```javascript
// BEFORE:
const c = useCart();

// AFTER:
const c = useCartContext();
```

**Change 3 — Asset paths in InstagramStrip tiles** (`sections.jsx` lines 112-116, the `tiles` array):
```javascript
// BEFORE:
{ img: 'assets/ig-yarn-1.svg', cap: 'Today\'s pour · Rose & Pepper' },
{ img: 'assets/ig-yarn-2.svg', cap: 'Charms drying overnight' },
{ img: 'assets/ig-yarn-3.svg', cap: 'Card stack, ready to ship' },
{ img: 'assets/ig-yarn-4.svg', cap: 'Workshop · Saturday set-up' },
{ img: 'assets/ig-yarn-5.svg', cap: 'The whole kit · workbench' },

// AFTER:
{ img: '/assets/ig-yarn-1.svg', cap: 'Today\'s pour · Rose & Pepper' },
{ img: '/assets/ig-yarn-2.svg', cap: 'Charms drying overnight' },
{ img: '/assets/ig-yarn-3.svg', cap: 'Card stack, ready to ship' },
{ img: '/assets/ig-yarn-4.svg', cap: 'Workshop · Saturday set-up' },
{ img: '/assets/ig-yarn-5.svg', cap: 'The whole kit · workbench' },
```

**Change 4 — Replace last line** (`sections.jsx` line 507):
```javascript
// REMOVE:
Object.assign(window, { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal, WhatsAppIcon });

// ADD:
export { About, Newsletter, InstagramStrip, Footer, CartDrawer, BookingModal, WhatsAppIcon }
```

---

### `src/lib/supabase.js` (new — stub)

**Analog:** None in codebase. Source: RESEARCH.md Pattern 11.

This file exists as a stub for Phase 2. It must be at exactly `src/lib/supabase.js` (CLAUDE.md constraint: Supabase client lives only here).

```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

The env vars are validated before this module loads (in `main.jsx`), so `createClient` will always receive defined strings at runtime.

---

### `vite.config.js` (new)

**Analog:** None in codebase. Source: RESEARCH.md Pattern 1.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

No path aliases, no custom publicDir — defaults suffice. `public/` is Vite's default static asset directory.

---

### `package.json` (new)

**Analog:** None in codebase (no package.json exists yet).

Minimum required fields:
```json
{
  "name": "cordycrafts",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router-dom": "6.30.3",
    "@supabase/supabase-js": "2.105.3"
  },
  "devDependencies": {
    "vite": "5.4.21",
    "@vitejs/plugin-react": "4.7.0"
  }
}
```

Versions are pinned exactly as verified in RESEARCH.md Standard Stack section.

---

### `vercel.json` (new)

**Analog:** None in codebase.

Exact content (from CONTEXT.md specifics):
```json
{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}
```

---

### `.env.example` (new)

**Analog:** None in codebase.

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_WHATSAPP_NUMBER=919876543210
```

Note: `VITE_WHATSAPP_NUMBER` format is the full number without `+` (for WhatsApp URL construction in Phase 2). The `.env.local` file (actual secrets) must be gitignored.

---

### `public/assets/` (migrate — move files)

**Analog:** `assets/` directory at repo root (current location).

**Operation:** Move the entire `assets/` directory to `public/assets/`. SVG filenames and internal directory structure (`assets/products/`) are preserved exactly — CLAUDE.md prohibits renaming or moving SVGs within the folder structure.

**Current structure to mirror:**
```
assets/
  hero-fox.svg
  category-amigurumi.svg
  category-bags.svg
  category-wearables.svg
  category-classes.svg
  ig-yarn-1.svg  through  ig-yarn-5.svg
  products/
    amigurumi-bear.svg
    scarf.svg
    market-bag.svg
    tote.svg
    coaster-set.svg
    amigurumi-bunny.svg
    blanket.svg
    cardigan.svg
    beanie.svg
    mug-cozy.svg
    granny-pillow.svg
    plant-hanger.svg
```

After move, Vite serves these at `/assets/*` and `/assets/products/*` from the `public/` directory. The path changes in the JSX files (Changes 5 in hero.jsx, Changes 5 in products.jsx, Changes 3 in sections.jsx) align to these absolute paths.

---

## Shared Patterns

### ES Module Export Convention
**Source:** All four CDN files use `Object.assign(window, {...})` at the last line.
**Replace with:** Named ES module export at the last line of each file.
**Apply to:** `src/primitives.jsx`, `src/hero.jsx`, `src/products.jsx`, `src/sections.jsx`

```javascript
// Pattern (last line of each migrated file):
export { ComponentA, ComponentB, utilityFn, DATA_CONSTANT }
```

### React Namespace Calls (No Destructuring Needed)
**Source:** All four CDN files use `React.useState`, `React.useEffect`, `React.useReducer`, `React.Fragment` — never destructured.
**Apply to:** All migrated files.
**Action:** Adding `import React from 'react'` at line 1 is sufficient. No additional named imports for hooks.

### Inline Styles with CSS Variables
**Source:** All component files, e.g., `primitives.jsx` line 54: `fontFamily: "var(--cc-font-script)"`, `hero.jsx` line 7: `background: 'rgba(255,250,250,0.92)'`
**Apply to:** All component files — no new CSS classes, only inline style objects referencing `var(--cc-*)` tokens.
**Action:** Never introduce CSS modules or styled-components. CSS variable names (`--cc-*`) must not change.

### INR Currency Formatting
**Source:** `products.jsx` line 44:
```javascript
const inr = (n) => '₹' + n.toLocaleString('en-IN');
```
**Apply to:** `inr` stays in `src/products.jsx`. `src/sections.jsx` imports it: `import { inr } from './products.jsx'`. Never hardcode ₹ amounts without `inr()`.

### Form Input Style Object
**Source:** `sections.jsx` lines 485-490 (shared `inp` style constant):
```javascript
const inp = {
  width: '100%', height: 46, padding: '0 14px', borderRadius: 10,
  border: 'none', background: '#ffffff', boxShadow: '0 0 0 1px #f5c0c0',
  fontFamily: 'var(--cc-font-sans)', fontSize: 14.5, color: '#3a2a2a', outline: 'none',
  boxSizing: 'border-box',
};
```
**Apply to:** `CartDrawer` and `BookingModal` both reference `inp` — stays in `src/sections.jsx`, not moved.

### Phone Input Sanitization
**Source:** `sections.jsx` line 296 (CartDrawer) and line 409 (BookingModal):
```javascript
onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
```
**Apply to:** All phone inputs. Pattern attribute `[0-9]{10}` on the `<input>` is also required.

### WhatsApp Number from Env
**Source:** No existing analog (CDN prototype doesn't use WhatsApp URL construction yet).
**Rule:** `import.meta.env.VITE_WHATSAPP_NUMBER` — never hardcoded. Applies to Phase 2 WhatsApp URL builder but the env var is validated in Phase 1 `main.jsx`.

---

## No Analog Found

Files with no close match in the codebase (use RESEARCH.md patterns):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `package.json` | config | — | No package.json exists yet; first npm project setup |
| `vite.config.js` | config | — | No build tool config exists; CDN prototype has no equivalent |
| `src/lib/supabase.js` | utility | — | No Supabase usage anywhere in prototype; stub for Phase 2 |
| `vercel.json` | config | — | No deployment config exists; first Vercel setup |
| `.env.example` | config | — | No env vars in prototype (CDN has no build step) |

---

## Metadata

**Analog search scope:** All 6 source files read in full (`index.html`, `primitives.jsx`, `hero.jsx`, `products.jsx`, `sections.jsx`, `colors_and_type.css`)
**Files scanned:** 6 source files + CONTEXT.md + RESEARCH.md
**Pattern extraction date:** 2026-05-07

**Key insight — migration is mechanical, not creative:** Every change to the four Claude Design files falls into exactly one of these five categories:
1. Add `import React from 'react'` at line 1
2. Add named imports from sibling files
3. Replace `window.X` reads with prop or context values (Nav only)
4. Change `'assets/...'` strings to `'/assets/...'` (leading slash)
5. Replace `Object.assign(window, {...})` with `export { ... }` at the last line

Any change beyond these five categories is a component rewrite and must not happen.

# Phase 3: Mobile Polish - Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 3 (1 new, 2 modified)
**Analogs found:** 3 / 3

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/hooks/useBreakpoint.js` | hook | event-driven | `src/hooks/useProducts.js` | role-match |
| `src/products.jsx` | component | request-response | `src/products.jsx` (self — existing `ProductGrid`, `ClassesGrid`) | exact (modify-in-place) |
| `index.html` | config | — | `index.html` (self — existing `<head>` and no `<style>` block yet) | exact (extend-in-place) |

---

## Pattern Assignments

### `src/hooks/useBreakpoint.js` (hook, event-driven)

**Analog:** `src/hooks/useProducts.js`

**Imports pattern** (`src/hooks/useProducts.js` lines 6–7):
```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
```
New file drops the supabase import; `useState` and `useEffect` are the only imports needed.

**Core hook pattern** (`src/hooks/useProducts.js` lines 9–22 — full file):
```js
export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('products').select('*')
      .then(({ data, error }) => {
        if (!error && data) setProducts(data)
        setLoading(false)
      })
  }, [])

  return { products, loading }
}
```
`useBreakpoint` follows the identical skeleton — one `useState`, one `useEffect` with cleanup, one return. Replace the Supabase fetch body with a `resize` listener body. Add the cleanup `return () => window.removeEventListener(...)` that the data hooks don't need (their effects run once and never clean up).

**Breakpoint logic to implement** (from 03-CONTEXT.md decisions D-01, D-02 and specifics):
```js
export function useBreakpoint() {
  const getBreakpoint = () => {
    const w = window.innerWidth
    if (w <= 640) return 'mobile'
    if (w <= 1024) return 'tablet'
    return 'desktop'
  }

  const [bp, setBp] = useState(getBreakpoint)

  useEffect(() => {
    const onResize = () => setBp(getBreakpoint())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return bp
}
```
No debounce (D-01 discretion note: resize events are cheap at this scale).

---

### `src/products.jsx` — `ProductGrid` (component, request-response)

**Analog:** `src/products.jsx` existing `ProductGrid` (lines 80–126)

**Existing grid line to replace** (line 117):
```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
```

**Responsive column mapping to apply** (from D-02 and specifics):
```jsx
const PRODUCT_COLS = { mobile: 2, tablet: 3, desktop: 4 }
// inside ProductGrid, after hook calls:
const bp = useBreakpoint()
const cols = PRODUCT_COLS[bp]
// replace static gridTemplateColumns with:
<div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
```

**Existing `loading` guard to replace** (line 83):
```jsx
if (loading) return null;
```
Replace with skeleton render (D-04: 12 cards, D-05: parchment base):
```jsx
if (loading) {
  return (
    <section id="shop" style={{ background: '#fffafa', padding: '120px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: 12, overflow: 'hidden', height: 280,
              background: 'linear-gradient(90deg, #f5e8dc 25%, #fff8f3 50%, #f5e8dc 75%)',
              backgroundSize: '800px 100%',
              animation: 'shimmer 1.4s infinite linear',
            }}/>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Import addition needed** at top of `src/products.jsx` (line 7, after existing hook imports):
```js
import { useBreakpoint } from './hooks/useBreakpoint.js'
```

---

### `src/products.jsx` — `ClassesGrid` (component, request-response)

**Analog:** `src/products.jsx` existing `ClassesGrid` (lines 185–237)

**Existing grid line to replace** (line 231):
```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
```

**Responsive column mapping to apply** (from D-02):
```jsx
const CLASS_COLS = { mobile: 1, tablet: 2, desktop: 2 }
// inside ClassesGrid, after hook calls:
const bp = useBreakpoint()
const cols = CLASS_COLS[bp]
// replace static gridTemplateColumns with:
<div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
```

**Existing `loading` guard to replace** (line 188):
```jsx
if (loading) return null;
```
Replace with skeleton render (D-04: 8 cards, D-05: parchment base). ClassCard height ~320px per context discretion note:
```jsx
if (loading) {
  return (
    <section id="classes" style={{ background: '#fce4e4', padding: '120px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: 12, overflow: 'hidden', height: 320,
              background: 'linear-gradient(90deg, #f5e8dc 25%, #fff8f3 50%, #f5e8dc 75%)',
              backgroundSize: '800px 100%',
              animation: 'shimmer 1.4s infinite linear',
            }}/>
          ))}
        </div>
      </div>
    </section>
  )
}
```

Note: `useBreakpoint` must be called unconditionally before the `if (loading)` guard in both grids, because React hooks cannot be called after a conditional return.

---

### `index.html` (config — `<head>` SEO tags + `<style>` keyframes)

**Analog:** `index.html` existing `<head>` (lines 3–7)

**Existing `<head>` to extend** (lines 3–7):
```html
<head>
<meta charset="utf-8">
<title>Cordy's Crafts · Hand-made with love</title>
<link rel="stylesheet" href="/colors_and_type.css">
</head>
```
Add SEO/OG meta tags after the existing tags (D-06, D-07). `og:image` uses placeholder domain per D-07; domain confirmed in Phase 4.

**SEO/OG block to insert** (inside `<head>`, after existing tags):
```html
<meta name="description" content="Cordy's Crafts — handmade paper crafts, clay, and candles from Cordeelia's studio in India. Shop online or book a small-group workshop.">
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="Cordy's Crafts · Hand-made with love">
<meta property="og:description" content="Handmade paper crafts, clay, and candles. Shop or book a workshop.">
<meta property="og:image" content="https://cordyscrafts.vercel.app/assets/cordys-logo.png">
<meta property="og:url" content="https://cordyscrafts.vercel.app/">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Cordy's Crafts · Hand-made with love">
<meta name="twitter:description" content="Handmade paper crafts, clay, and candles. Shop or book a workshop.">
<meta name="twitter:image" content="https://cordyscrafts.vercel.app/assets/cordys-logo.png">
```

**`@keyframes shimmer` block to add** (D-03 — add to `<head>` as a `<style>` tag, since `index.html` has no `<style>` block yet; this is the first one):
```html
<style>
@keyframes shimmer {
  from { background-position: -800px 0; }
  to   { background-position:  800px 0; }
}
</style>
```
The `backgroundSize: '800px 100%'` on each skeleton card matches the keyframe travel distance so the sweep appears to move across the card.

---

## Shared Patterns

### Inline styles — no new CSS classes
**Source:** All of `src/products.jsx`, `src/sections.jsx`
**Apply to:** All new skeleton card divs, all `gridTemplateColumns` changes
All layout uses `style={{...}}` objects. No class names are introduced. The `@keyframes shimmer` rule is the only CSS written outside a JS style object — it must live in a `<style>` tag because CSS keyframes cannot be expressed as inline styles.

### `useEffect` with cleanup
**Source:** `src/hooks/useProducts.js` lines 13–19 (no cleanup — single-shot fetch)
**Apply to:** `src/hooks/useBreakpoint.js`
`useBreakpoint` is the only hook in the project that adds a persistent event listener, so it is also the only hook that needs a `return () => ...` cleanup in its `useEffect`. Copy the `useEffect(() => { ... }, [])` shape from `useProducts`, and add the cleanup return.

### Hook return shape
**Source:** `src/hooks/useProducts.js` line 21, `src/hooks/useClasses.js` line 20
**Apply to:** `src/hooks/useBreakpoint.js`
Both existing hooks return a plain object: `return { products, loading }` / `return { classes, loading }`. `useBreakpoint` returns a bare string (`'mobile' | 'tablet' | 'desktop'`), not an object — simpler because there is only one value. Callers use `const bp = useBreakpoint()`.

### Hook call order before conditional returns
**Source:** React rules-of-hooks; observed in existing grids (`useProducts` / `useClasses` called on lines 81 and 186 before the `if (loading) return null` guards)
**Apply to:** `ProductGrid` and `ClassesGrid` modifications
`const bp = useBreakpoint()` must be called on the same line order every render, before any conditional return. Place it immediately after the existing `useProducts()` / `useClasses()` call.

---

## No Analog Found

No files in this phase are without an analog.

---

## Metadata

**Analog search scope:** `src/hooks/`, `src/products.jsx`, `index.html`, `src/App.jsx`, `src/main.jsx`
**Files scanned:** 7
**Pattern extraction date:** 2026-05-07

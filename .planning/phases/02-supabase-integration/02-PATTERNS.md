# Phase 2: Supabase Integration — Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 6 new/modified files
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/hooks/useProducts.js` | hook | request-response (SELECT) | `src/CartContext.jsx` (useCartContext hook) | role-match |
| `src/hooks/useClasses.js` | hook | request-response (SELECT) | `src/CartContext.jsx` (useCartContext hook) | role-match |
| `src/products.jsx` (modify ProductGrid + ClassesGrid) | component | CRUD | `src/products.jsx` (ProductGrid lines 156-200) | exact (self-modify) |
| `src/sections.jsx` (modify CartDrawer submit + BookingModal submit) | component | request-response (INSERT) | `src/sections.jsx` CartDrawer lines 227-233 | exact (self-modify) |
| `supabase/migrations/20260507000000_init_schema.sql` | config | batch | none (first migration) | no analog |
| `supabase/seed.sql` | config | batch | none (first seed) | no analog |
| `src/__tests__/whatsapp.test.js` | test | transform | `src/__tests__/CartContext.test.jsx` | role-match |
| `src/__tests__/supabase.test.js` | test | request-response | `src/__tests__/CartContext.test.jsx` | role-match |

---

## Pattern Assignments

### `src/hooks/useProducts.js` (hook, request-response)

**Analog:** `src/CartContext.jsx` — provides the React hook skeleton (useState + useEffect + return value object).

**Imports pattern** (CartContext.jsx lines 1-4):
```js
import React from 'react'
// (no external imports for CartContext — for hooks, add supabase import:)
import { supabase } from '../lib/supabase.js'
```

**Core hook pattern** (CartContext.jsx lines 34-59 — useReducer + useEffect lifecycle):
```js
export function CartProvider({ children }) {
  const [items, dispatch] = React.useReducer(cartReducer, null, loadCart)

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])
  // ...
}

export function useCartContext() {
  return React.useContext(CartContext)
}
```

**What useProducts.js must do instead:**
- `useState([])` for data, `useState(true)` for loading — no useReducer
- `useEffect` with empty `[]` dependency array — one-time fetch on mount
- `supabase.from('products').select('*').then(({ data, error }) => { ... })` inside useEffect
- On error: leave data as `[]`, set loading false — no console.log, no throw
- Return `{ products, loading }` (not a context value)

**Full pattern for useProducts.js:**
```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

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

---

### `src/hooks/useClasses.js` (hook, request-response)

**Analog:** `src/hooks/useProducts.js` (once created — identical structure, different table name).

**Full pattern for useClasses.js** — copy useProducts.js exactly, change two tokens:
```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export function useClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('classes').select('*')
      .then(({ data, error }) => {
        if (!error && data) setClasses(data)
        setLoading(false)
      })
  }, [])

  return { classes, loading }
}
```

---

### `src/products.jsx` — ProductGrid modification (component, CRUD)

**Analog:** `src/products.jsx` lines 156-199 (ProductGrid's existing filter + render logic).

**Current pattern to replace** (lines 156-160):
```js
const ProductGrid = ({ accent }) => {
  const [filter, setFilter] = React.useState('All');
  const cats = ['All', 'Paper Crafts', 'Clay', 'Candles'];
  const items = filter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
  return (
```

**What changes:**
- Add `import { useProducts } from './hooks/useProducts.js'` at top of file
- Inside `ProductGrid`, call `const { products, loading } = useProducts()`
- Add `if (loading) return null;` guard immediately after the hook call
- Replace `PRODUCTS` references with `products` in the filter line and "View all" count
- `PRODUCTS` const and its data can be removed from the file (or kept for now — planner decides)

**Modified ProductGrid opening** (what the new code looks like):
```js
const ProductGrid = ({ accent }) => {
  const { products, loading } = useProducts();
  if (loading) return null;
  const [filter, setFilter] = React.useState('All');
  const cats = ['All', 'Paper Crafts', 'Clay', 'Candles'];
  const items = filter === 'All' ? products : products.filter(p => p.cat === filter);
  return (
    // ... rest unchanged except PRODUCTS.length → products.length on line 195
```

**Note on field name differences:** Supabase rows use `category` (not `cat`) per the schema. The filter `.filter(p => p.cat === filter)` will need to become `.filter(p => p.category === filter)`. `ProductCard` also reads `p.cat` for `<Overline>` — must change to `p.category`. The `c.add()` call maps `cat: p.cat` — must become `cat: p.category`.

---

### `src/products.jsx` — ClassesGrid modification (component, CRUD)

**Analog:** `src/products.jsx` lines 259-308 (ClassesGrid's existing filter + render logic).

**Current pattern to replace** (lines 259-266):
```js
const ClassesGrid = ({ accent, onBook }) => {
  const [filter, setFilter] = React.useState('All');
  const filters = ['All', 'Paper Crafts', 'Clay', 'Candles', 'Online', 'Offline'];
  const items = CLASSES.filter(k =>
    filter === 'All' ? true :
    (filter === 'Online' || filter === 'Offline') ? (k.mode === filter || k.mode === 'Both') :
    k.craft === filter
  );
```

**What changes:**
- Call `const { classes, loading } = useClasses()` at the top
- Add `if (loading) return null;` guard
- Replace `CLASSES` with `classes` in the filter expression
- Supabase rows use no `craft` field — they use `category`. Change `k.craft === filter` to `k.category === filter`
- `ClassCard` renders `k.craft` in `<Overline>` — change to `k.category`
- `ClassCard` key is currently `k.sku` — Supabase rows have `k.id` (uuid), switch key to `k.id`
- `onBook(k)` passes the full Supabase row — `klass.id` will be available for BookingModal INSERT

**Modified ClassesGrid opening:**
```js
const ClassesGrid = ({ accent, onBook }) => {
  const { classes, loading } = useClasses();
  if (loading) return null;
  const [filter, setFilter] = React.useState('All');
  const filters = ['All', 'Paper Crafts', 'Clay', 'Candles', 'Online', 'Offline'];
  const items = classes.filter(k =>
    filter === 'All' ? true :
    (filter === 'Online' || filter === 'Offline') ? (k.mode === filter || k.mode === 'Both') :
    k.category === filter
  );
  // ... grid renders: key={k.id} instead of key={k.sku}
```

**Note on ClassCard field mapping:**
- `k.date` in hardcoded data → `k.date_label` in Supabase schema
- `k.time` in hardcoded data → no `time` column in Supabase (not in schema)
- `k.seats` in hardcoded data → `k.seats_left` in Supabase schema
- `k.craft` → `k.category`
- `k.location` → not in Supabase schema (inline in mode display logic, remove or omit)
- These field renames affect `ClassCard` render lines 233-236 and 245

---

### `src/sections.jsx` — CartDrawer submit modification (component, request-response INSERT)

**Analog:** `src/sections.jsx` lines 227-233 (current synchronous `submit` handler in CartDrawer).

**Current submit pattern** (lines 227-233):
```js
const submit = (e) => {
  e.preventDefault();
  if (!form.name || !form.phone) return;
  setConfirmation({ ...form, total: c.total(), items: [...c.items] });
  setStage('done');
  c.clear();
};
```

**What changes:**
- Add two new state vars at the top of `CartDrawer`: `const [submitting, setSubmitting] = React.useState(false)` and `const [submitError, setSubmitError] = React.useState(null)`
- `submit` becomes async
- Before INSERT: `setSubmitting(true)`, `setSubmitError(null)`
- `await supabase.from('orders').insert({...})` — items mapped to `{ sku, name, qty, price }` only (strip `img`, `cat`)
- On error: `setSubmitError('Something went wrong — please try again.')`, `setSubmitting(false)`, return (no WhatsApp)
- On success: build order message, `window.open(waUrl, '_blank')`, `c.clear()`, `setStage('done')`, `setSubmitting(false)`
- `confirmation` state is no longer needed (done stage reads from the message that already opened)
- Submit button gains `disabled={submitting}` attribute

**Add supabase import** at top of `src/sections.jsx` (line 1-5 area):
```js
import { supabase } from './lib/supabase.js'
```

**New submit handler:**
```js
const [submitting, setSubmitting] = React.useState(false);
const [submitError, setSubmitError] = React.useState(null);

const submit = async (e) => {
  e.preventDefault();
  if (!form.name || !form.phone) return;
  setSubmitting(true);
  setSubmitError(null);

  const { error } = await supabase.from('orders').insert({
    customer_name: form.name,
    customer_whatsapp: form.phone,
    address: form.addr,
    items: c.items.map(i => ({ sku: i.sku, name: i.name, qty: i.qty, price: i.price })),
    total_amount: c.total(),
    payment_status: 'pending',
  });

  if (error) {
    setSubmitError('Something went wrong — please try again.');
    setSubmitting(false);
    return;
  }

  const msg = buildOrderMessage(form, c.items, c.total());
  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  c.clear();
  setStage('done');
  setSubmitting(false);
};
```

**Error display** — add below the submit button (inside the form's footer div, after the submit button, lines 342-349 area):
```js
{submitError && (
  <div style={{ marginTop: 8, fontFamily: 'var(--cc-font-sans)', fontSize: 13, color: '#c0392b', textAlign: 'center' }}>
    {submitError}
  </div>
)}
```

**Submit button** — add `disabled={submitting}` and update label:
```js
<button type="submit" disabled={submitting} style={{ ... }}>
  <WhatsAppIcon size={18}/> {submitting ? 'Sending...' : 'Send order to Cordeelia'}
</button>
```

**buildOrderMessage helper** (add as a module-level function above CartDrawer):
```js
function buildOrderMessage(form, items, total) {
  const lines = [
    'New Order',
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Address: ${form.addr || 'Not provided'}`,
    '',
    'Items:',
    ...items.map(i => `- ${i.name} x${i.qty} ₹${i.price * i.qty}`),
    '',
    `Total: ₹${total}`,
  ];
  return lines.join('\n');
}
```

---

### `src/sections.jsx` — BookingModal submit modification (component, request-response INSERT)

**Analog:** `src/sections.jsx` lines 400-404 (current synchronous BookingModal submit).

**Current submit pattern** (lines 400-404):
```js
const submit = (e) => {
  e.preventDefault();
  if (!form.name || !form.phone) return;
  setStage('done');
};
```

**What changes — same structure as CartDrawer:**
- Add `const [submitting, setSubmitting] = React.useState(false)` and `const [submitError, setSubmitError] = React.useState(null)` inside `BookingModal`
- `submit` becomes async
- INSERT to `bookings` table with `class_id: klass.id` (uuid from Supabase row — not `klass.sku`)
- On error: set submitError, re-enable button, return (no WhatsApp)
- On success: build booking message, `window.open(waUrl, '_blank')`, `setStage('done')`

**New BookingModal submit handler:**
```js
const [submitting, setSubmitting] = React.useState(false);
const [submitError, setSubmitError] = React.useState(null);

const submit = async (e) => {
  e.preventDefault();
  if (!form.name || !form.phone) return;
  setSubmitting(true);
  setSubmitError(null);

  const { error } = await supabase.from('bookings').insert({
    class_id: klass.id,
    customer_name: form.name,
    customer_whatsapp: form.phone,
    seats: form.seats,
    mode_preference: form.pref,
    message: form.note || null,
    payment_status: 'pending',
  });

  if (error) {
    setSubmitError('Something went wrong — please try again.');
    setSubmitting(false);
    return;
  }

  const msg = buildBookingMessage(form, klass);
  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  setStage('done');
  setSubmitting(false);
};
```

**buildBookingMessage helper** (add alongside buildOrderMessage, module-level):
```js
function buildBookingMessage(form, klass) {
  const lines = [
    'New Booking',
    `Class: ${klass.name}`,
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Seats: ${form.seats}`,
    `Mode: ${form.pref}`,
  ];
  if (form.note) lines.push(`Notes: ${form.note}`);
  return lines.join('\n');
}
```

---

### `src/__tests__/whatsapp.test.js` (test, transform)

**Analog:** `src/__tests__/CartContext.test.jsx` — pure function import + describe/it/expect structure.

**Test file structure pattern** (CartContext.test.jsx lines 1-8):
```js
// CartContext behavioral stubs — implemented by Plan 02 (src/CartContext.jsx)
// These tests define the contract. Run: npx vitest run CartContext.test.jsx

import { cartReducer } from '../CartContext.jsx'

const item1 = { sku: 'p01', name: 'Test Bear', price: 100, img: '/assets/x.svg', cat: 'Clay' }
```

**What whatsapp.test.js must do:**
- Import `buildOrderMessage` and `buildBookingMessage` as named exports from `src/sections.jsx` (planner must ensure they are exported)
- No DOM, no React, no supabase client — pure string functions
- Vitest globals (`describe`, `it`, `expect`) — no import needed (globals: true in vitest.config.js)

**whatsapp.test.js structure:**
```js
// WhatsApp message builder tests — covers WA-01, WA-02, WA-03
// Run: npx vitest run whatsapp.test

import { buildOrderMessage, buildBookingMessage } from '../sections.jsx'

const form = { name: 'Priya', phone: '9876543210', addr: '12 MG Road, Bengaluru' }
const items = [
  { sku: 'p01', name: 'Stamped Birthday Card', qty: 2, price: 180 },
  { sku: 'k01', name: 'Rose Garden Soy Candle', qty: 1, price: 650 },
]
const total = 1010

describe('buildOrderMessage', () => {
  it('contains customer name', () => {
    expect(buildOrderMessage(form, items, total)).toContain('Name: Priya')
  })
  it('contains item names with qty and line total in ₹', () => {
    const msg = buildOrderMessage(form, items, total)
    expect(msg).toContain('Stamped Birthday Card x2 ₹360')
    expect(msg).toContain('Rose Garden Soy Candle x1 ₹650')
  })
  it('contains grand total in ₹', () => {
    expect(buildOrderMessage(form, items, total)).toContain('Total: ₹1010')
  })
})

describe('buildBookingMessage', () => {
  const klass = { name: 'Card Making with Stamps', id: 'uuid-abc' }
  const bookingForm = { name: 'Priya', phone: '9876543210', seats: 2, pref: 'Online', note: '' }

  it('contains class name', () => {
    expect(buildBookingMessage(bookingForm, klass)).toContain('Class: Card Making with Stamps')
  })
  it('omits Notes line when note is empty', () => {
    expect(buildBookingMessage(bookingForm, klass)).not.toContain('Notes:')
  })
  it('includes Notes line when note is present', () => {
    const formWithNote = { ...bookingForm, note: 'Veg food only' }
    expect(buildBookingMessage(formWithNote, klass)).toContain('Notes: Veg food only')
  })
})
```

---

### `src/__tests__/supabase.test.js` (test, request-response)

**Analog:** `src/__tests__/CartContext.test.jsx` — pure function extraction + mock injection.

**Strategy:** Extract the insert-then-gate guard logic into a testable pure function (as recommended in RESEARCH.md). The function accepts a mock supabase-like object and returns `{ ok, error }`.

**Test file structure pattern** (main.test.jsx lines 1-15 — inline logic extraction pattern):
```js
// Env var validation stubs — implemented by Plan 06 (src/main.jsx)
// These tests verify the validation logic in isolation.
// Run: npx vitest run main.test.jsx

describe('env var validation logic', () => {
  function findMissing(env) {
    return REQUIRED_VARS.filter(k => !env[k])
  }
  it('returns empty array when all vars are present', () => { ... })
})
```

**supabase.test.js structure:**
```js
// Supabase insert-then-gate guard tests — covers SUPA-04, SUPA-05
// Run: npx vitest run supabase.test

// Extracted logic — mirrors what CartDrawer/BookingModal submit does
async function submitOrder(supabase, payload) {
  const { error } = await supabase.from('orders').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

async function submitBooking(supabase, payload) {
  const { error } = await supabase.from('bookings').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true, error: null }
}

describe('submitOrder — insert-then-gate guard', () => {
  it('returns ok:true when supabase returns no error', async () => {
    const mockSupabase = { from: () => ({ insert: async () => ({ error: null }) }) }
    const result = await submitOrder(mockSupabase, { customer_name: 'Priya' })
    expect(result.ok).toBe(true)
  })

  it('returns ok:false when supabase returns an error', async () => {
    const mockSupabase = { from: () => ({ insert: async () => ({ error: { message: 'DB error' } }) }) }
    const result = await submitOrder(mockSupabase, { customer_name: 'Priya' })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('DB error')
  })
})

describe('submitBooking — insert-then-gate guard', () => {
  it('returns ok:true when supabase returns no error', async () => {
    const mockSupabase = { from: () => ({ insert: async () => ({ error: null }) }) }
    const result = await submitBooking(mockSupabase, { class_id: 'uuid-abc' })
    expect(result.ok).toBe(true)
  })

  it('returns ok:false when supabase returns an error', async () => {
    const mockSupabase = { from: () => ({ insert: async () => ({ error: { message: 'FK error' } }) }) }
    const result = await submitBooking(mockSupabase, { class_id: 'uuid-abc' })
    expect(result.ok).toBe(false)
  })
})
```

---

## Shared Patterns

### React State Conventions
**Source:** `src/CartContext.jsx` and `src/sections.jsx` throughout
**Apply to:** All new state in hooks and modified submit handlers

```js
// Pattern: React.useState for component state, always destructured
const [loading, setLoading] = React.useState(true)
const [submitting, setSubmitting] = React.useState(false)
const [submitError, setSubmitError] = React.useState(null)

// Pattern: useEffect with empty array for one-time mount side effects
React.useEffect(() => {
  // fetch logic
}, [])

// Pattern: Immutable form updates via spread
setForm({ ...form, name: e.target.value })
```

### Import Organization
**Source:** `src/sections.jsx` lines 1-6 and `src/products.jsx` lines 1-4
**Apply to:** All modified and new files

```js
// Existing import style — named exports from relative paths, no alias
import React from 'react'
import { useCartContext } from './CartContext.jsx'
import { inr } from './products.jsx'
// New addition for sections.jsx:
import { supabase } from './lib/supabase.js'
// New addition for hooks:
import { supabase } from '../lib/supabase.js'
```

### Error Handling Convention
**Source:** CLAUDE.md and `src/CartContext.jsx` lines 30-32
**Apply to:** useProducts, useClasses, CartDrawer submit, BookingModal submit

```js
// No try/catch, no console.log — silent failure via state
// In hooks: error → leave data as [], set loading false
if (!error && data) setProducts(data)
setLoading(false)

// In submit handlers: error → set error state, re-enable button, return
if (error) {
  setSubmitError('Something went wrong — please try again.')
  setSubmitting(false)
  return
}
```

### env var access
**Source:** `src/lib/supabase.js` lines 3-5 and `src/main.jsx` line 9
**Apply to:** Both submit handlers (wa.me URL construction)

```js
// Always via import.meta.env — never hardcoded
import.meta.env.VITE_WHATSAPP_NUMBER
import.meta.env.VITE_SUPABASE_URL
```

### No console.log / console.warn
**Source:** CLAUDE.md
**Apply to:** All files — errors communicated via React state only

### Inline styles only
**Source:** CLAUDE.md and all existing components
**Apply to:** Error message display for submitError — use inline style object, not CSS class

```js
// Error display pattern — inline style, red color, sans font
{submitError && (
  <div style={{
    marginTop: 8, fontFamily: 'var(--cc-font-sans)',
    fontSize: 13, color: '#c0392b', textAlign: 'center'
  }}>
    {submitError}
  </div>
)}
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `supabase/migrations/20260507000000_init_schema.sql` | config | batch (DDL) | No existing migrations — first schema file; use RESEARCH.md Pattern 4 directly |
| `supabase/seed.sql` | config | batch (DML) | No existing seed — first seed file; write INSERT statements for all 12 products and 8 classes rows |

---

## Critical Field Mapping Notes (Planner Must Know)

### PRODUCTS hardcoded → Supabase schema field renames

| Hardcoded field | Supabase column | Affected locations |
|-----------------|-----------------|-------------------|
| `p.cat` | `p.category` | ProductGrid filter (line 159), ProductCard Overline (line 128), c.add() call (line 93) |
| `p.blurb` | not in schema | Remove from ProductCard or treat as nullable display field — schema has no `blurb` column |
| `p.accent` (boolean) | `p.accent` (text hex or null) | ProductCard accent logic (line 121) — must check `!!p.accent` not `p.accent === true` |

### CLASSES hardcoded → Supabase schema field renames

| Hardcoded field | Supabase column | Affected locations |
|-----------------|-----------------|-------------------|
| `k.craft` | `k.category` | ClassesGrid filter (line 264), ClassCard Overline (line 223) |
| `k.date` | `k.date_label` | ClassCard date display (line 233) |
| `k.time` | not in schema | ClassCard time display (line 233) — omit or make conditional |
| `k.seats` | `k.seats_left` | ClassCard seats display (line 237), BookingModal seat max (line 444) |
| `k.location` | not in schema | ClassCard where display (line 235) — omit |
| `k.sku` (as key) | `k.id` (uuid) | ClassCard `key={k.sku}` → `key={k.id}`, BookingModal uses `klass.id` for FK |
| `k.blurb` | not in schema | ClassCard blurb display (line 228) — remove or treat as nullable |

### BookingModal klass.seats vs klass.seats_left
The BookingModal `Math.min(klass.seats, ...)` on line 444 must become `Math.min(klass.seats_left, ...)` after migration. If `seats_left` is null (nullable column), add fallback: `Math.min(klass.seats_left ?? 99, ...)`.

---

## Metadata

**Analog search scope:** `src/`, `src/__tests__/`, `src/lib/`
**Files scanned:** 7 (CartContext.jsx, CartContext.test.jsx, main.test.jsx, products.jsx, sections.jsx, lib/supabase.js, main.jsx)
**Pattern extraction date:** 2026-05-07

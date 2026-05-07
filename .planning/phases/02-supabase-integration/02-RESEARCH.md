# Phase 2: Supabase Integration — Research

**Researched:** 2026-05-07
**Domain:** Supabase JS v2 client, RLS policies, Supabase CLI migrations, React data-fetching hooks, WhatsApp URL construction
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Supabase client initialized only in `src/lib/supabase.js` — never instantiated elsewhere
- Supabase write MUST complete before wa.me link opens — failed write = no WhatsApp redirect
- `payment_status='pending'` on every INSERT to orders and bookings (Razorpay future-proofing)
- `VITE_WHATSAPP_NUMBER` always from env vars — never hardcoded
- RLS INSERT-only policies on orders/bookings must be set before any live data flows
- `img` stores local path strings (`/assets/products/...`, `/assets/classes/...`) — no Supabase Storage
- `tag` and `accent` are nullable on products
- Seed data lives in `supabase/seed.sql` (Supabase CLI convention)
- While fetching: `ProductGrid` and `ClassesGrid` return `null` — no spinner in Phase 2
- On fetch error: silent empty grid — no error surface, no console.log
- Failed INSERT: inline red error line below submit button (`"Something went wrong — please try again."`) — form stays filled, button re-enables immediately
- WhatsApp message format is fixed structured lines (see Table Schema Reference in CONTEXT.md)
- If `message` field is empty in bookings, omit the `Notes:` line entirely

### Claude's Discretion

None stated — all material decisions were locked this session.

### Deferred Ideas (OUT OF SCOPE)

- Loading skeletons (Phase 3)
- Responsive grid breakpoints (Phase 3)
- Newsletter Supabase write (v2)
- Instagram strip dynamic data (v2)
- Razorpay payment flow (v2)
- Custom admin dashboard (v2)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUPA-01 | Supabase client initialized only in `src/lib/supabase.js` | Client is already a real createClient call — just needs env vars wired (they already are) |
| SUPA-02 | Products fetched from Supabase `products` table via `useProducts` hook | useEffect + useState pattern; supabase.from('products').select('*'); replaces PRODUCTS array |
| SUPA-03 | Classes fetched from Supabase `classes` table via `useClasses` hook | Same pattern as SUPA-02; replaces CLASSES array |
| SUPA-04 | Cart checkout writes to `orders` table before wa.me opens | await insert, check error, only then open window.location.href; CartContext items structure documented below |
| SUPA-05 | Class booking writes to `bookings` table before wa.me opens | Same guard pattern; klass.id (uuid from Supabase row) maps to class_id FK |
| SUPA-06 | RLS enabled on all four tables — anon INSERT-only on orders/bookings | SQL migration with ALTER TABLE ENABLE RLS + CREATE POLICY for each table |
| WA-01 | Cart checkout builds wa.me URL with pre-filled message | encodeURIComponent of structured order message; opened after successful insert |
| WA-02 | Class booking builds wa.me URL with pre-filled message | Same pattern; class name, date_label, seats, mode_preference, customer name |
| WA-03 | WhatsApp number always from VITE_WHATSAPP_NUMBER | import.meta.env.VITE_WHATSAPP_NUMBER — already enforced in env validation |
</phase_requirements>

---

## Summary

Phase 2 wires the already-scaffolded Vite app to a live Supabase backend. Three streams of work run in parallel: (1) schema — create migration SQL files that set up tables and RLS, (2) data reads — replace hardcoded `PRODUCTS` / `CLASSES` arrays with `useEffect` hooks that call `supabase.from(...).select('*')`, and (3) data writes — replace the placeholder `submit` handlers in `CartDrawer` and `BookingModal` with an `await supabase.from(...).insert(...)` call that gates the wa.me redirect.

The `src/lib/supabase.js` stub is already a real client — it calls `createClient` with env vars from `import.meta.env`. No change to the client file is needed. The Supabase JS package (`@supabase/supabase-js@2.105.3`) is already installed. Migration SQL files are hand-authored in `supabase/migrations/` (no Docker required for `supabase db push`). The developer applies the migration against their remote project using `npx supabase link && npx supabase db push`.

The existing `CartDrawer` submit handler calls `c.clear()` and sets `stage='done'` synchronously. Phase 2 replaces this with an async handler: await the INSERT, check `error`, either set an inline error state or call `window.open(waUrl)` then `c.clear()` then `setStage('done')`. No component structure changes are needed — only the logic inside `submit` changes.

**Primary recommendation:** Write one migration file with all four CREATE TABLE + ENABLE RLS + CREATE POLICY statements. Seed data goes in `supabase/seed.sql`. Use a single `useProducts` and `useClasses` hook file. Wire the CartDrawer and BookingModal submit handlers as async functions.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Products / classes catalog | Database (Supabase) | Browser (React state) | Source of truth is Supabase; React state is a local copy for render |
| Order persistence | Database (Supabase) | — | INSERT must complete before WhatsApp opens; no client-side persistence |
| Booking persistence | Database (Supabase) | — | Same as orders |
| RLS enforcement | Database (Supabase) | — | Enforced by Postgres; not enforceable client-side |
| WhatsApp URL construction | Browser (Client) | — | URL built from React form state + env var; no backend needed |
| Error state for failed INSERT | Browser (React state) | — | Inline UI error; no backend logging in Phase 2 |
| Loading state for SELECT | Browser (React state) | — | `useState(true)` for loading; return null while in-flight |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.105.3 | Supabase JS client — SELECT, INSERT, RLS-aware | Already installed; official client [VERIFIED: npm registry] |
| React | 18.3.1 | Hooks for data fetching (useEffect, useState) | Already in project |
| Vite / import.meta.env | 8.0.10 | Env var injection at build time | Already in project |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| npx supabase CLI | 2.98.2 | Generate/push migration files to remote project | Developer runs once to push schema |

**No new npm dependencies needed for Phase 2.** All required packages are already installed.

**Version verification:**
`@supabase/supabase-js` latest is `2.105.3` as of 2026-05-07. [VERIFIED: npm registry — `npm view @supabase/supabase-js version`]

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (React)
  │
  ├─ ProductGrid / ClassesGrid
  │    └─ useProducts / useClasses hook
  │         └─ supabase.from('products').select('*')  ──► Supabase DB (products / classes tables)
  │              error → [] (silent)
  │              loading → null render
  │
  ├─ CartDrawer (submit)
  │    └─ async handleSubmit
  │         ├─ supabase.from('orders').insert({...})  ──► Supabase DB (orders table, RLS: anon INSERT only)
  │         │    error → setError / re-enable button
  │         │    success → window.open(wa.me URL) → c.clear() → setStage('done')
  │         └─ wa.me URL ──► User's WhatsApp app
  │
  └─ BookingModal (submit)
       └─ async handleSubmit
            ├─ supabase.from('bookings').insert({...})  ──► Supabase DB (bookings table, RLS: anon INSERT only)
            │    error → setError / re-enable button
            │    success → window.open(wa.me URL) → setStage('done')
            └─ wa.me URL ──► User's WhatsApp app

Supabase DB
  ├─ products  (RLS: anon SELECT only)
  ├─ classes   (RLS: anon SELECT only)
  ├─ orders    (RLS: anon INSERT only)
  └─ bookings  (RLS: anon INSERT only)
```

### Recommended Project Structure

```
supabase/
├── migrations/
│   └── 20260507000000_init_schema.sql   # CREATE TABLE + ENABLE RLS + CREATE POLICY for all 4 tables
└── seed.sql                              # INSERT rows for products and classes

src/
├── lib/
│   └── supabase.js          # Already exists — real createClient, no changes needed
├── hooks/
│   ├── useProducts.js       # NEW: useEffect SELECT from products
│   └── useClasses.js        # NEW: useEffect SELECT from classes
├── products.jsx             # Remove hardcoded PRODUCTS/CLASSES; use hooks in ProductGrid/ClassesGrid
└── sections.jsx             # Replace placeholder submit in CartDrawer/BookingModal with async + INSERT
```

### Pattern 1: Data-Fetch Hook (useProducts / useClasses)

**What:** A custom hook that runs a Supabase SELECT on mount, returns `{ data, loading }`.
**When to use:** Anywhere a component needs to replace a hardcoded array with live Supabase data.

```js
// Source: Verified against Context7 /supabase/supabase-js + CONTEXT.md decisions
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

**Critical:** `loading` starts `true`. `ProductGrid` and `ClassesGrid` return `null` while `loading` is true. On error, `setLoading(false)` still runs — the grid renders empty. No `console.log`.

### Pattern 2: Insert-Then-WhatsApp (async submit handler)

**What:** Replace synchronous `submit` with async; await INSERT; gate wa.me on success.
**When to use:** CartDrawer and BookingModal submit handlers.

```js
// Source: Verified against Context7 /supabase/supabase-js + CONTEXT.md decisions
const [submitting, setSubmitting] = useState(false)
const [submitError, setSubmitError] = useState(null)

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!form.name || !form.phone) return
  setSubmitting(true)
  setSubmitError(null)

  const { error } = await supabase.from('orders').insert({
    customer_name: form.name,
    customer_whatsapp: form.phone,
    address: form.addr,
    items: c.items.map(i => ({ sku: i.sku, name: i.name, qty: i.qty, price: i.price })),
    total_amount: c.total(),
    payment_status: 'pending',
  })

  if (error) {
    setSubmitError('Something went wrong — please try again.')
    setSubmitting(false)
    return          // WhatsApp link NEVER opens on error
  }

  const msg = buildOrderMessage(form, c.items, c.total())
  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  c.clear()
  setStage('done')
  setSubmitting(false)
}
```

**Key:** `insert()` without `.select()` returns `{ data: null, error }` — the returned `data` is null. Only check `error`. [VERIFIED: Context7 /supabase/supabase-js]

**Note on `items` JSONB serialization:** `c.items` from CartContext is an array of `{ sku, name, price, img, cat, qty }`. The INSERT should send only `{ sku, name, qty, price }` as specified in the schema — do not include `img` or `cat` in the JSONB column. Map explicitly.

### Pattern 3: WhatsApp URL Construction

**What:** Build a wa.me URL with `encodeURIComponent` on the pre-formatted message.
**When to use:** After successful INSERT in both CartDrawer and BookingModal.

```js
// Source: CONTEXT.md locked format + [ASSUMED] wa.me URL spec
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
  ]
  return lines.join('\n')
}

function buildBookingMessage(form, klass) {
  const lines = [
    'New Booking',
    `Class: ${klass.name}`,
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Seats: ${form.seats}`,
    `Mode: ${form.pref}`,
  ]
  if (form.note) lines.push(`Notes: ${form.note}`)
  return lines.join('\n')
}

// Usage:
const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER
window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank')
```

**Note on `window.open` vs `window.location.href`:** Use `window.open(..., '_blank')` on mobile to open WhatsApp without navigating away from the app. `window.location.href` would navigate the page. [ASSUMED — wa.me UX convention]

### Pattern 4: Migration File Structure

**What:** SQL file in `supabase/migrations/` with timestamp prefix. Contains all DDL for Phase 2.
**When to use:** One file per phase is acceptable for initial schema creation.

```sql
-- supabase/migrations/20260507000000_init_schema.sql
-- Source: Verified against Context7 /supabase/supabase + CONTEXT.md schema reference

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price integer not null,
  img text not null,
  tag text,
  accent text,
  sku text not null,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

create policy "public read products"
  on products for select to anon
  using (true);

-- Classes
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  price integer not null,
  img text not null,
  date_label text,
  seats_left integer,
  duration text,
  mode text,
  created_at timestamptz not null default now()
);

alter table classes enable row level security;

create policy "public read classes"
  on classes for select to anon
  using (true);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_whatsapp text not null,
  address text not null,
  items jsonb not null,
  total_amount integer not null,
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "anon insert orders"
  on orders for insert to anon
  with check (true);

-- Bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) not null,
  customer_name text not null,
  customer_whatsapp text not null,
  seats integer not null,
  mode_preference text,
  message text,
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

create policy "anon insert bookings"
  on bookings for insert to anon
  with check (true);
```

**Naming convention:** `YYYYMMDDHHmmss_short_description.sql` (UTC) [VERIFIED: Context7 /supabase/supabase — migration file naming]

**Push workflow (manual, developer runs once):**
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### Anti-Patterns to Avoid

- **Opening wa.me before checking INSERT error:** The WhatsApp link MUST be inside the `if (!error)` branch. The only reason Phase 2 exists is this guard.
- **Calling `.select()` after `.insert()` unnecessarily:** We do not need the inserted row's ID. Omit `.select()` on orders/bookings INSERT — it also creates additional RLS surface that the anon role cannot SELECT.
- **`import { supabase } from './lib/supabase.js'` in any file other than hooks:** Supabase client flows from `src/lib/supabase.js` only. Hooks import from there and components import from hooks.
- **Hardcoding the WhatsApp number:** Always `import.meta.env.VITE_WHATSAPP_NUMBER`.
- **Using `window.location.href` for wa.me:** Opens WhatsApp by navigating away. Use `window.open(..., '_blank')` so the SPA stays loaded.
- **Logging errors to console:** CLAUDE.md and project conventions prohibit `console.log` / `console.warn`. The error state is communicated via React state only.
- **Sending full CartContext item shape to JSONB:** CartContext items include `img` and `cat` which are not in the orders schema. Map to `{ sku, name, qty, price }` explicitly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database queries | Custom fetch to PostgREST API | `supabase.from().select()` | Auth headers, error normalization, RLS handled automatically |
| RLS enforcement | Client-side permission checks | Postgres RLS policies | Client-side checks are advisory; only Postgres enforces |
| JSONB serialization | Custom serializer | `JSON.stringify` via JS object literal in `.insert()` | Supabase JS sends body as `application/json` automatically |
| URL encoding of WhatsApp message | Custom encoder | `encodeURIComponent()` | Native, handles all Unicode including ₹ symbol |

---

## CartContext Items — Shape for JSONB Serialization

The `items` array from `useCartContext()` has this shape per item:

```js
// From src/CartContext.jsx ADD action:
{ sku: 'p01', name: 'Stamped Birthday Card', price: 180, img: '/assets/products/x.svg', cat: 'Paper Crafts', qty: 2 }
```

**What goes into the `orders.items` JSONB column** (per schema):
```js
// Strip img and cat — schema specifies only {sku, name, qty, price}
items: c.items.map(i => ({ sku: i.sku, name: i.name, qty: i.qty, price: i.price }))
```

**What `c.total()` returns:** `items.reduce((s, i) => s + i.qty * i.price, 0)` — a plain integer (whole ₹). This maps directly to `total_amount` (integer column).

---

## BookingModal — klass Shape for INSERT

When a booking is submitted, the `klass` prop passed to `BookingModal` is a row from the Supabase `classes` table. After Phase 2 data migration, `klass` will have:

```js
{
  id: 'uuid-string',      // maps to bookings.class_id FK
  name: 'Card Making...',
  date_label: 'Sat 23 May 2026',
  seats_left: 8,
  duration: '2.5 hrs',
  mode: 'Both',           // 'Both' | 'Online' | 'Offline'
  price: 1200,
  img: '/assets/classes/...',
  // ...
}
```

**Pre-migration:** `klass` comes from the hardcoded CLASSES array in `products.jsx`, which uses `sku` not `id`. After migration the ClassesGrid will pass Supabase rows with `id` (uuid). The `BookingModal` will need `klass.id` for the FK insert.

**Impact:** The BookingModal submit must use `class_id: klass.id`. This is a new field not present in the hardcoded CLASSES shape (which uses `sku`). The planner must account for this transition — once ClassesGrid fetches from Supabase, `klass.id` will be present.

---

## Common Pitfalls

### Pitfall 1: INSERT without `.select()` returns `data: null`

**What goes wrong:** Developer destructures `{ data, error }` from an insert call without `.select()`, checks `data`, finds `null`, assumes failure.
**Why it happens:** Supabase JS v2 `insert()` without `.select()` is a "fire and forget" — it returns `{ data: null, error: null }` on success.
**How to avoid:** Check only `error`. If `error` is null, the insert succeeded regardless of `data`.
**Warning signs:** Code with `if (!data)` after an insert — should be `if (error)` instead.

[VERIFIED: Context7 /supabase/supabase-js — insert docs show `const { error } = await supabase.from('comments').delete().eq('id', ...)` pattern where only error is checked]

### Pitfall 2: RLS blocks INSERT if not explicitly enabled

**What goes wrong:** Tables are created without `alter table X enable row level security`. The default is RLS disabled — all authenticated and anon users can do everything. The requirement is the opposite: explicitly enable RLS, then grant only what's needed.
**Why it happens:** Forgetting the `alter table` statement after CREATE TABLE.
**How to avoid:** Always pair `create table` with `alter table X enable row level security` in the migration.
**Warning signs:** Anon users can SELECT from orders/bookings — should return empty result set with RLS; if data comes back, RLS is off.

[VERIFIED: Context7 /supabase/supabase — RLS enable docs]

### Pitfall 3: useEffect dependency array causes infinite re-fetch

**What goes wrong:** `useEffect(() => { fetch... }, [products])` — the dependency is the state being set inside the effect, causing an infinite loop.
**Why it happens:** Forgetting that the dependency array controls re-run, not the initial fetch.
**How to avoid:** Use empty dependency array `[]` for one-time mount fetch.
**Warning signs:** Network tab shows repeated Supabase calls; browser freezes or slows.

### Pitfall 4: Classes grid BookingModal receives hardcoded sku instead of uuid id

**What goes wrong:** When `onBook(k)` is called in `ClassesGrid`, it passes the full row from the Supabase response. If the BookingModal INSERT uses `klass.sku` as class_id instead of `klass.id`, the FK insert will fail (type mismatch — text vs uuid).
**Why it happens:** The hardcoded CLASSES array used `sku` as the identifier. Supabase rows have `id` (uuid).
**How to avoid:** BookingModal submit must use `class_id: klass.id` (the Supabase-generated uuid).
**Warning signs:** Bookings INSERT returns an error about FK constraint violation.

### Pitfall 5: wa.me URL with non-E.164 phone number

**What goes wrong:** `import.meta.env.VITE_WHATSAPP_NUMBER` contains `+919876543210` with a `+`. WhatsApp's wa.me format requires the number without `+`.
**Why it happens:** People commonly store phone numbers with country code prefix including `+`.
**How to avoid:** Store `VITE_WHATSAPP_NUMBER` as `919876543210` (no `+`). Document this in `.env.example`.
**Warning signs:** WhatsApp opens to "Invalid number" error page.

[ASSUMED — based on wa.me URL spec; production verification recommended]

---

## `src/lib/supabase.js` — Current State

The file already contains a real client initialization:

```js
// src/lib/supabase.js — as it exists today
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**No changes needed to this file.** It is already a real Supabase client. The env vars it reads are already validated in `src/main.jsx` at startup. [VERIFIED: read src/lib/supabase.js]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Supabase JS v1 `.from().insert()` returned data by default | v2 `.insert()` returns `{ data: null, error }` without `.select()` | Supabase JS v2 (2022) | Must check `error`, not `data` |
| `supabase.from().on('INSERT', cb).subscribe()` | `supabase.channel().on('postgres_changes', ...).subscribe()` | Supabase JS v2 | Not used in Phase 2 — Phase 2 has no realtime; listed for awareness |

**Not deprecated, just unused in this phase:** Supabase Auth — not needed for Phase 2 (WhatsApp checkout requires no login).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server, tests | Yes | v22.16.0 | — |
| @supabase/supabase-js | All Supabase calls | Yes (installed) | 2.105.3 | — |
| npx supabase CLI | Migration push | Yes (npx) | 2.98.2 | Manual SQL in Supabase Dashboard |
| Supabase project (remote) | All data operations | Not verified | — | Developer must provision |
| vitest | Tests | Yes (installed) | 4.1.5 | — |
| @testing-library/react | React hook tests | Not installed | — | Test pure logic functions; no DOM hook testing |

**Missing dependencies with no fallback:**
- A live Supabase project (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) — developer must create one at supabase.com before running the app against a real backend. Local dev can use a `.env.local` pointing to the real project.

**Missing dependencies with fallback:**
- `@testing-library/react` — not installed. Wave 0 tests for Phase 2 should test pure functions (message builder, items mapper, filter logic) that do not require DOM rendering. Hook testing that requires React context is out of scope for the test wave.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 |
| Config file | `vitest.config.js` (exists) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUPA-02 | `useProducts` returns [] on error, [] while loading | unit (pure logic) | `npx vitest run useProducts` | No — Wave 0 gap |
| SUPA-03 | `useClasses` returns [] on error, [] while loading | unit (pure logic) | `npx vitest run useClasses` | No — Wave 0 gap |
| SUPA-04 | INSERT error → WhatsApp link not opened | unit (mock supabase) | `npx vitest run supabase.test` | No — Wave 0 gap |
| SUPA-05 | Booking INSERT error → WhatsApp link not opened | unit (mock supabase) | `npx vitest run supabase.test` | No — Wave 0 gap |
| WA-01 | Order message contains item names, qtys, ₹ totals, customer name | unit (pure fn) | `npx vitest run whatsapp.test` | No — Wave 0 gap |
| WA-02 | Booking message contains class name, seats, mode, customer name | unit (pure fn) | `npx vitest run whatsapp.test` | No — Wave 0 gap |
| WA-03 | wa.me URL uses VITE_WHATSAPP_NUMBER | unit (pure fn) | `npx vitest run whatsapp.test` | No — Wave 0 gap |
| SUPA-01 | Client initialized only in supabase.js | manual/grep | `grep -r createClient src/` — only one result | N/A — code review |
| SUPA-06 | RLS policies set correctly | manual | Supabase Dashboard → Table Editor → Auth policies | N/A — SQL not unit-testable |

**Testing strategy note:** SUPA-04 and SUPA-05 (the insert-then-gate guard) are best tested by extracting the submit logic into a pure function that accepts a `supabase` dependency. The function returns `{ ok: boolean, error: string | null }`. This can be tested with a mock supabase object — no DOM required.

WA-01 and WA-02 are testable as pure functions: `buildOrderMessage(form, items, total)` and `buildBookingMessage(form, klass)` return plain strings. Tests assert the string contains required substrings.

### Sampling Rate

- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + manual Supabase table editor verification before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/whatsapp.test.js` — covers WA-01, WA-02, WA-03 (buildOrderMessage, buildBookingMessage pure functions)
- [ ] `src/__tests__/supabase.test.js` — covers SUPA-04, SUPA-05 (insert-then-gate logic with mocked supabase client)

---

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No login required in Phase 2 |
| V3 Session Management | No | No sessions |
| V4 Access Control | Yes | Supabase RLS — anon INSERT only on orders/bookings; anon SELECT only on products/classes |
| V5 Input Validation | Yes | HTML5 `required` + `pattern` on phone fields (already in components); JSONB items built from trusted React state |
| V6 Cryptography | No | No encryption needed; no passwords |
| V7 Error Handling | Yes | Error messages must not expose internal Supabase error details to users — only show "Something went wrong — please try again." |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Anon user SELECTs from orders (reads other customers' data) | Information Disclosure | RLS policy on orders — no SELECT for anon. Enforced in migration. |
| Anon user UPDATEs payment_status to 'paid' | Tampering | No UPDATE policy on orders or bookings for anon. RLS default-deny. |
| Malformed items JSONB (very large payload) | Denial of Service | Supabase default row size limits apply [ASSUMED]. Phase 2 does not add server-side validation beyond HTML5. |
| XSS via WhatsApp message content | Tampering | WhatsApp message is constructed server-side (phone), not rendered back into the DOM. Low risk. |
| Hardcoded WhatsApp number | Information Disclosure | CLAUDE.md and env validation prevent this. |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `window.open(waUrl, '_blank')` is the correct wa.me invocation on mobile — keeps SPA loaded | Pattern 3: WhatsApp URL Construction | Low: worse case is user navigates away; easily fixed to `window.location.href` |
| A2 | wa.me URL requires phone number without `+` prefix (e.g., `919876543210`) | Pitfall 5 | Medium: WhatsApp opens but shows "invalid number" — document in .env.example |
| A3 | Supabase default payload limits are sufficient for the items JSONB array (12 products max) | Security Domain | Very low: a 12-item order is tiny JSON |
| A4 | `npx supabase db push` works without Docker for pushing migrations to a remote-only project | Environment Availability | Low: developer can always apply SQL manually via Supabase Dashboard SQL editor as fallback |

---

## Open Questions

1. **Does BookingModal currently receive a `klass.id` field?**
   - What we know: The hardcoded CLASSES array in `products.jsx` has `sku` but no `id` field. After the Supabase migration, the `classes` table rows will have `id` (uuid). The `ClassesGrid` will need to pass Supabase rows (with `id`) through `onBook` to `BookingModal`.
   - What's unclear: The planner must ensure `ClassesGrid` replaces CLASSES with `useClasses()` data before `BookingModal` references `klass.id`.
   - Recommendation: Plan the ClassesGrid useClasses hook task before the BookingModal INSERT task — they are a dependency chain.

2. **Should `supabase/seed.sql` use `INSERT` or `INSERT ... ON CONFLICT DO NOTHING`?**
   - What we know: If the developer runs the seed twice, plain INSERT will fail with duplicate PK.
   - Recommendation: Use `INSERT INTO products ... ON CONFLICT (sku) DO NOTHING;` for idempotent seeding. [ASSUMED — Supabase seed.sql is typically idempotent]

---

## Sources

### Primary (HIGH confidence)
- Context7 `/supabase/supabase-js` — SELECT, INSERT, error handling patterns, v2 insert-returns-null behavior
- Context7 `/supabase/supabase` — RLS enable + CREATE POLICY SQL, migration naming convention, supabase db push workflow, seed.sql conventions
- npm registry `npm view @supabase/supabase-js version` — confirmed v2.105.3 is latest stable
- Source code reads: `src/lib/supabase.js`, `src/CartContext.jsx`, `src/products.jsx`, `src/sections.jsx`, `src/App.jsx`, `src/main.jsx`, `package.json`, `vitest.config.js`

### Secondary (MEDIUM confidence)
- CONTEXT.md (`02-CONTEXT.md`) — locked schema decisions, WhatsApp message format, UX decisions for error states and loading states

### Tertiary (LOW confidence)
- wa.me URL format (no + prefix requirement) — training knowledge, not verified via official WhatsApp docs this session [A2]
- `window.open(..., '_blank')` for wa.me on mobile — training knowledge [A1]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — packages verified via npm registry and direct read of package.json
- Architecture: HIGH — patterns verified against Context7 official Supabase JS v2 docs
- Pitfalls: HIGH for Supabase-specific pitfalls (verified); MEDIUM for wa.me URL pitfalls (assumed)
- RLS policies: HIGH — exact SQL verified against Context7 Supabase docs
- CartContext item shape: HIGH — read directly from source

**Research date:** 2026-05-07
**Valid until:** 2026-06-07 (Supabase JS stable channel; RLS policy syntax stable)

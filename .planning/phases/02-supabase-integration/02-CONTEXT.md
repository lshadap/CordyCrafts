---
phase: 02-supabase-integration
status: ready-to-plan
created: 2026-05-07
source: discuss-phase session
---

# Phase 2 Context — Supabase Integration

## Locked Decisions (from prior phases)

- Supabase client lives only in `src/lib/supabase.js` — never initialised elsewhere
- Supabase write MUST complete before wa.me link opens — failed write = no WhatsApp redirect
- `payment_status='pending'` on every INSERT to orders and bookings (Razorpay future-proofing)
- `VITE_WHATSAPP_NUMBER` always from env vars — never hardcoded
- RLS INSERT-only policies on orders/bookings must be set before any live data flows

## Decisions Made This Session

### Area 1 — Image field strategy

**`img` column: local path strings on both tables**
- Products: `img` stores `/assets/products/{filename}.svg` — no Supabase Storage, no CDN URLs
- Classes: `img` also stores `/assets/classes/{filename}.svg` — same local-path approach
- Rationale: SVG assets are already committed to repo; avoids Supabase Storage setup complexity

**Nullable columns on products**
- `tag` (e.g., "New", "Bestseller") is nullable — not all products have a tag
- `accent` (override color for a product card) is nullable — falls back to global accent

**Initial data: SQL seed file**
- A `seed.sql` file committed to the repo inserts all products and classes rows
- Location: `supabase/seed.sql` (Supabase CLI convention)
- Enables reproducible setup — devs run it once against their Supabase project
- Cordeelia manages live data via Supabase table editor thereafter

### Area 2 — Loading state scope

**While fetching: render nothing**
- `ProductGrid` and `ClassesGrid` return `null` while the Supabase query is in flight
- No spinner, no skeleton cards in Phase 2 — Phase 3 adds proper loading skeletons
- Keeps Phase 2 focused on data wiring, not polish

**On fetch error: silent empty grid**
- If the Supabase SELECT fails, the grid renders empty (no rows, no error message)
- No `console.log` or error surface to the user

### Area 3 — Failed write UX

**Inline error below the submit button**
- If the Supabase INSERT fails, a red error line appears below the submit button:
  `"Something went wrong — please try again."`
- The form stays filled — all field values are preserved
- The submit button re-enables immediately so the user can tap it again (no separate Retry button)
- WhatsApp link never opens on INSERT failure (constraint locked from prior phases)

### Area 4 — WhatsApp message format

**Orders — structured lines:**
```
New Order
Name: {customer_name}
Phone: {customer_whatsapp}
Address: {address}

Items:
- {item name} x{qty} ₹{line total}
- ...

Total: ₹{grand total}
```

**Bookings — structured lines:**
```
New Booking
Class: {class name}
Name: {customer_name}
Phone: {customer_whatsapp}
Seats: {seats}
Mode: {mode_preference}
Notes: {message}
```

- WhatsApp number always from `import.meta.env.VITE_WHATSAPP_NUMBER`
- `wa.me/{number}?text={encodeURIComponent(message)}`
- If `message` field is empty in bookings, omit the `Notes:` line

## Table Schema Reference

### `products`
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid (PK) | no | default gen_random_uuid() |
| name | text | no | |
| category | text | no | "Paper Crafts", "Clay", "Candles" |
| price | integer | no | paise or whole ₹ — whole ₹ |
| img | text | no | local path `/assets/products/...` |
| tag | text | yes | "New", "Bestseller", etc. |
| accent | text | yes | hex override, e.g. '#d4a27a' |
| sku | text | no | short identifier |
| created_at | timestamptz | no | default now() |

### `classes`
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid (PK) | no | default gen_random_uuid() |
| name | text | no | |
| subtitle | text | yes | short descriptor |
| price | integer | no | whole ₹ |
| img | text | no | local path `/assets/classes/...` |
| date_label | text | yes | human-readable date string |
| seats_left | integer | yes | display only |
| duration | text | yes | e.g. "2 hours" |
| mode | text | yes | "In-person", "Online", "Both" |
| created_at | timestamptz | no | default now() |

### `orders`
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid (PK) | no | default gen_random_uuid() |
| customer_name | text | no | |
| customer_whatsapp | text | no | digits only |
| address | text | no | |
| items | jsonb | no | array of {sku, name, qty, price} |
| total_amount | integer | no | whole ₹ |
| payment_status | text | no | default 'pending' |
| created_at | timestamptz | no | default now() |

### `bookings`
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid (PK) | no | default gen_random_uuid() |
| class_id | uuid (FK → classes.id) | no | |
| customer_name | text | no | |
| customer_whatsapp | text | no | digits only |
| seats | integer | no | |
| mode_preference | text | yes | "In-person", "Online" |
| message | text | yes | optional note |
| payment_status | text | no | default 'pending' |
| created_at | timestamptz | no | default now() |

## RLS Policies Required

```sql
-- orders: anon can INSERT only
CREATE POLICY "anon insert orders" ON orders
  FOR INSERT TO anon WITH CHECK (true);

-- bookings: anon can INSERT only
CREATE POLICY "anon insert bookings" ON bookings
  FOR INSERT TO anon WITH CHECK (true);

-- products and classes: public SELECT, no write from client
CREATE POLICY "public read products" ON products
  FOR SELECT TO anon USING (true);

CREATE POLICY "public read classes" ON classes
  FOR SELECT TO anon USING (true);
```

Row Level Security must be ENABLED on all four tables before any live data flows.

## What the Researcher Should Investigate

- Supabase JS v2 client usage patterns for SELECT (with error handling) and INSERT
- `supabase.from('products').select('*')` inside `useEffect` — correct pattern
- How to call `.insert({...})` and await the result before opening a wa.me link
- Whether `.select()` after `.insert()` is needed to get the new row id (not required here)
- Supabase CLI migration file conventions (`supabase/migrations/`, `supabase/seed.sql`)
- How to enable RLS and write policies via SQL migration files

## What the Planner Should Know

- `src/lib/supabase.js` already exists as a stub — planner should wire the real client (URL + anon key from env)
- `src/products.jsx` currently exports `PRODUCTS` and `CLASSES` as hardcoded arrays — these must be replaced with Supabase fetches in `ProductGrid` and `ClassesGrid` components
- `CartDrawer` (in `src/sections.jsx`) already has a form and submit handler — planner must replace the placeholder submit with: INSERT to orders → then open wa.me
- `BookingModal` (in `src/sections.jsx`) already has a form — same pattern: INSERT to bookings → then open wa.me
- No new React components needed — all wiring is inside existing components
- Loading state is `null` (no render) — a single `const [loading, setLoading] = useState(true)` per grid, return `null` if loading
- Error state is silent — no UI change needed beyond preserving the empty array default

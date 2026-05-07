---
phase: 02-supabase-integration
reviewed: 2026-05-07T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/__tests__/whatsapp.test.js
  - src/__tests__/supabase.test.js
  - src/__tests__/useProducts.test.js
  - src/__tests__/useClasses.test.js
  - supabase/migrations/20260507000000_init_schema.sql
  - supabase/seed.sql
  - src/lib/whatsapp.js
  - src/hooks/useProducts.js
  - src/hooks/useClasses.js
  - src/products.jsx
  - src/sections.jsx
findings:
  critical: 4
  warning: 6
  info: 3
  total: 13
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-07
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

This phase wires Supabase into CartDrawer and BookingModal, extracts WhatsApp message builders, replaces the hardcoded product/class arrays with live hook fetches, and adds the DB migration + seed. The core data-flow logic is sound and the insert-then-gate pattern is correctly implemented. However, four blockers were found: two security issues (missing RLS on `orders`/`bookings` for SELECT, and an unvalidated `address` field that can be empty-string in a NOT NULL column), one logic error that causes the BookingModal form to silently ignore the phone number the customer just typed when the modal re-opens, and one runtime crash when `useCartContext()` returns null. Six warnings cover schema mismatches, a broken `seats_left` upper-bound constraint, unhandled promise rejections, and missing form-reset on CartDrawer close. Three info items cover placeholder tests, a confusing variable shadow, and a hardcoded location fallback that references a removed field.

---

## Critical Issues

### CR-01: `orders` and `bookings` tables allow anon SELECT via Supabase JS default behaviour

**File:** `supabase/migrations/20260507000000_init_schema.sql:65-89`

**Issue:** The migration comment says "no SELECT/UPDATE/DELETE policy means those are implicitly denied." This is correct for pure SQL but **wrong for the Supabase JS client**. The Supabase client appends `apikey` (the `anon` role) to every request. PostgreSQL RLS only denies operations that have no matching policy when `FORCE ROW LEVEL SECURITY` is set on the role or when no policies exist — but the Supabase `anon` role is granted `USAGE` on the schema and `SELECT` on tables by default in the Supabase-generated `anon` grant. Because the orders/bookings tables have RLS enabled but no explicit `DENY` or `SELECT` policy, the anon role can still read all rows via a direct REST API call (`GET /rest/v1/orders`). Any visitor can enumerate every order (customer name, phone, address) or booking by hitting the Supabase REST endpoint directly.

**Fix:** Add explicit deny-by-default SELECT policies — the safest pattern is to add no SELECT policy at all AND revoke the default `SELECT` grant from `anon` on these tables:

```sql
-- Revoke the Supabase default SELECT grant from anon on sensitive tables
revoke select on orders   from anon;
revoke select on bookings from anon;
```

Or, if revoking is not possible in your Supabase tier, add a restrictive SELECT policy that always returns false:

```sql
create policy "deny anon select orders"
  on orders for select to anon using (false);

create policy "deny anon select bookings"
  on bookings for select to anon using (false);
```

---

### CR-02: `address` column is `NOT NULL` but `CartDrawer` inserts `''` (empty string)

**File:** `src/sections.jsx:254` cross-referenced with `supabase/migrations/20260507000000_init_schema.sql:56`

**Issue:** The migration defines `address text not null`. The CartDrawer submit handler inserts `address: form.addr || ''` (line 254 in sections.jsx). An empty string is not NULL, so Postgres accepts it — but the schema comment implies address is required. More critically, if the constraint is ever tightened to `check (address <> '')` (a natural next step), or if Supabase adds a not-empty check trigger, every order without a delivery address silently fails. The immediate practical bug: the Supabase test fixture (`supabase.test.js:26`) sets `address: '12 MG Road'` but real users skip it routinely, meaning the insert succeeds with `''` while the WhatsApp message shows `"Address: Not provided"`. The DB and the WhatsApp message are inconsistent — the DB holds `''` but the message holds `'Not provided'`.

**Fix:** Store the same canonical fallback in both places:

```js
// sections.jsx — CartDrawer submit handler
address: form.addr || 'Not provided',
```

This keeps the DB value and the WhatsApp message in sync, and avoids empty-string in a semantically required column.

---

### CR-03: `useCartContext()` is called unconditionally outside a `CartProvider` — runtime crash

**File:** `src/products.jsx:13` and `src/hooks/useProducts.js` (indirect)

**Issue:** `ProductCard` calls `const c = useCartContext()` at line 13 of `products.jsx`. `useCartContext()` returns `React.useContext(CartContext)`, which is `null` when no `CartProvider` wraps the tree (see `CartContext.jsx:57-59`). If any parent renders `<ProductCard>` without a `CartProvider` ancestor, the call to `c.add(...)` inside `onAdd` (line 17) throws `Cannot read properties of null (reading 'add')`, crashing the entire React subtree. This is a latent crash: the app currently only renders `ProductCard` inside the full app tree which presumably has a `CartProvider`, but there is no guard, meaning a test, Storybook render, or any future partial render will hard-crash.

**Fix:** Guard the context usage:

```js
const c = useCartContext();
if (!c) return null; // or throw a clearer error during development
```

Or enforce the contract at the hook level in `CartContext.jsx`:

```js
export function useCartContext() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCartContext must be used inside <CartProvider>')
  return ctx
}
```

---

### CR-04: BookingModal form state is stale on re-open — `phone` and `name` are not reset

**File:** `src/sections.jsx:448-456`

**Issue:** The `useEffect` that fires when `klass` changes (line 448) resets `seats` and `pref` but does **not** reset `form.name` or `form.phone`. When a user books one class (filling in name + phone), closes the modal, then opens it for a different class, the form pre-fills with the previous customer's name and phone. This is a logic error: the effect is intended to "reset for a new class" but it only partially resets. Additionally, `setStage('form')` and `setSubmitError(null)` are unconditionally called even when `klass` is `null` (the effect runs before the `if (!klass) return null` guard on line 458), which means a null `klass` triggers a state update on an about-to-be-unmounted render path.

**Fix:** Reset the full form on klass change:

```js
React.useEffect(() => {
  if (!klass) return; // guard null before any state updates
  setForm({
    name: '',
    phone: '',
    seats: 1,
    pref: klass.mode === 'Both' ? 'Online' : klass.mode,
    note: '',
  });
  setStage('form');
  setSubmitError(null);
  setSubmitting(false);
}, [klass]);
```

---

## Warnings

### WR-01: `seats_left` upper-bound is not enforced — user can book more seats than available

**File:** `src/sections.jsx:527`

**Issue:** The seats increment button uses `Math.min(klass.seats_left ?? 99, form.seats + 1)` to cap the count. This is purely client-side. Nothing in the migration adds a `check` constraint or trigger to prevent `seats > seats_left` in the DB insert. A user who manually edits the DOM (or calls the Supabase API directly) can insert a booking with more seats than available without any rejection. Even within the UI, `klass.seats_left` is a snapshot from mount time — if two users are booking simultaneously, both could fill the last remaining seat.

**Fix (minimum):** Add a DB-level check constraint in the migration:

```sql
-- In the bookings table definition or as ALTER TABLE:
alter table bookings add constraint seats_positive check (seats >= 1);
```

For true overbooking prevention, a trigger that checks remaining seats against existing bookings is required. At minimum, document the known race condition.

---

### WR-02: `address` schema mismatch — migration says NOT NULL but field label says "(optional)"

**File:** `src/sections.jsx:369` vs `supabase/migrations/20260507000000_init_schema.sql:56`

**Issue:** The form field label reads "Delivery address or note (optional)" and there is no `required` attribute on the textarea. The DB column is `address text not null`. The current workaround (inserting `''`) papers over the mismatch, but the contract is wrong: the schema says required, the UI says optional. A future developer tightening the schema will break the form silently.

**Fix:** Either add `check (address <> '')` and make the field required in the form, or change the migration column to `address text` (nullable) and update the insert to use `form.addr || null`.

---

### WR-03: Unhandled promise rejection in `useProducts` and `useClasses` on network failure

**File:** `src/hooks/useProducts.js:14-18`, `src/hooks/useClasses.js:14-18`

**Issue:** The `.then()` chain only handles the resolved case. If the Supabase `fetch` itself rejects (network offline, DNS failure, CORS error before the response is parsed), the promise rejects and there is no `.catch()` handler. In a browser environment this surfaces as an unhandled promise rejection warning and `loading` stays `true` forever, leaving the page blank (both `ProductGrid` and `ClassesGrid` return `null` while `loading` is true — line 83 and line 188 of products.jsx respectively).

**Fix:**

```js
useEffect(() => {
  supabase.from('products').select('*')
    .then(({ data, error }) => {
      if (!error && data) setProducts(data)
      setLoading(false)
    })
    .catch(() => setLoading(false)) // network failure — fail open, show empty grid
}, [])
```

---

### WR-04: `buildWaUrl` silently produces a broken URL when `VITE_WHATSAPP_NUMBER` is undefined

**File:** `src/lib/whatsapp.js:37-39`

**Issue:** If `import.meta.env.VITE_WHATSAPP_NUMBER` is undefined (missing `.env.local`, CI environment without the variable set), `number` is `undefined` and the resulting URL is `https://wa.me/undefined?text=...`. WhatsApp silently rejects this URL or opens without a recipient. There is no validation or early error, and `window.open` happily opens the broken URL.

**Fix:**

```js
export function buildWaUrl(message) {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER
  if (!number) throw new Error('VITE_WHATSAPP_NUMBER is not set')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
```

Callers in `CartDrawer` and `BookingModal` already wrap `buildWaUrl` after a successful insert, so the thrown error would propagate to the submit handler — add a `.catch` or `try/catch` there to show `submitError` rather than a blank crash.

---

### WR-05: CartDrawer does not reset `form` state on close — stale data reappears

**File:** `src/sections.jsx:229-236`

**Issue:** The `useEffect` on `open` (line 229) resets `stage`, `confirmation`, `submitError`, and `submitting` when the drawer closes — but it does not reset `form` (`{ name, phone, addr }`). A user who starts filling in the form, closes the drawer without submitting, and then reopens it will see their previously-typed name and phone still present. While sometimes useful (progressive disclosure), this is inconsistent with the BookingModal (which resets everything on klass change) and can expose a previous customer's details if the same device is shared.

**Fix:** Add `setForm({ name: '', phone: '', addr: '' })` to the close effect:

```js
React.useEffect(() => {
  if (!open) {
    setStage('cart');
    setConfirmation(null);
    setSubmitError(null);
    setSubmitting(false);
    setForm({ name: '', phone: '', addr: '' }); // add this line
  }
}, [open]);
```

---

### WR-06: `ClassCard` renders `k.seats_left` as "max" but it is actually "remaining"

**File:** `src/products.jsx:162`

**Issue:** The UI renders `{k.seats_left} max` (line 162). The column name is `seats_left`, which semantically means remaining seats, not max capacity. Displaying `seats_left` as "max" is misleading — a class that started with 10 seats and has 3 left would show "3 max", incorrectly implying the class only holds 3 people. The seed data shows initial values that happen to be maximums, but this will break once bookings reduce the count.

**Fix:** Change the label to match the column semantics:

```jsx
<div><span style={{ color: '#a85050' }}>Seats · </span>{k.seats_left} left</div>
```

---

## Info

### IN-01: Placeholder tests for `useProducts` and `useClasses` always pass regardless of implementation

**File:** `src/__tests__/useProducts.test.js:9-12`, `src/__tests__/useClasses.test.js:9-12`

**Issue:** Both test files contain a single `expect(true).toBe(true)` stub. They are documented as intentional deferrals, but they provide false confidence in CI: the test suite will show green even if the hooks are completely broken. The file headers acknowledge this and point to manual browser validation.

**Fix:** Add a comment to the CI configuration or test runner config to explicitly mark these as known-skipped stubs so they are visible as skipped rather than passing:

```js
it.skip('todo: real hook test deferred until @testing-library/react is installed', () => {
  expect(true).toBe(true)
})
```

Using `it.skip` makes the intent explicit in the test output without making the suite fail.

---

### IN-02: Variable `c` shadows the outer `c` (filter loop variable) inside `ProductGrid`

**File:** `src/products.jsx:104`

**Issue:** `ProductGrid` renders a list of filter buttons with `cats.map(c => ...)` at line 104. The outer scope at line 81 also has `const { products, loading } = useProducts()`. This is harmless since `c` (the cart) is only used inside `ProductCard`, not in `ProductGrid` directly. However, the single-letter loop variable `c` on line 104 is the same name used for the cart context throughout the file — a future developer adding cart interaction to the filter buttons would silently shadow the wrong thing.

**Fix (low priority):** Rename the filter loop variable to `cat` for clarity:

```jsx
{cats.map(cat => (
  <button key={cat} onClick={() => setFilter(cat)} ...>{cat}</button>
))}
```

---

### IN-03: BookingModal references `klass.location` which is not in the DB schema

**File:** `src/sections.jsx:541`

**Issue:** Line 541 reads `klass.location.split(',')[0]` to show a short location label on the "Offline" mode button. The `classes` table schema has no `location` column (only `mode`, `date_label`, `duration`). `klass.location` will always be `undefined` for rows fetched from Supabase, so the ternary `klass.location ? ...` always short-circuits to the empty string `''`, and the button shows "Offline" with no location suffix. This is dead code — the branch can never be taken with live data.

**Fix:** Remove the dead branch entirely:

```jsx
{['Online', 'Offline'].map(o => (
  <button key={o} type="button" onClick={() => setForm({ ...form, pref: o })} ...>
    {o}
  </button>
))}
```

Or add a `location` column to the schema if the feature is intended.

---

_Reviewed: 2026-05-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

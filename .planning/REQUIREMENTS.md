# Requirements: Cordy's Crafts

**Defined:** 2026-05-06
**Core Value:** A customer on a phone can browse the full catalogue, add items to cart, and place an order that lands in Cordeelia's WhatsApp — all in under a minute.

## v1 Requirements

### Scaffold (Vite Migration)

- [ ] **SCAF-01**: Vite 5 + React + React Router v6 project scaffold created with `src/` directory structure, `package.json`, `vite.config.js`, and `index.html` entry point
- [ ] **SCAF-02**: All Claude Design components (`primitives.jsx`, `hero.jsx`, `products.jsx`, `sections.jsx`) imported as ES modules — no rewrites, no renames
- [ ] **SCAF-03**: `colors_and_type.css` imported globally in `main.jsx` — all CSS variable names preserved exactly
- [ ] **SCAF-04**: `CartContext` implemented with `useReducer` + `localStorage` persistence, replacing all `window.cart`, `window.openCart`, `window.cartCount`, and `Object.assign(window, {...})` globals
- [ ] **SCAF-05**: `vercel.json` committed with SPA rewrite rule (`"source":"/(.*)", "destination":"/index.html"`) — must be present before first deploy
- [ ] **SCAF-06**: Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`) wired via `import.meta.env` with startup validation that fails loudly if any are missing

### Supabase Integration

- [ ] **SUPA-01**: Supabase client initialized only in `src/lib/supabase.js` — never instantiated elsewhere
- [ ] **SUPA-02**: Products fetched dynamically from Supabase `products` table via `useProducts` hook — replaces hardcoded `PRODUCTS` array
- [ ] **SUPA-03**: Classes fetched dynamically from Supabase `classes` table via `useClasses` hook — replaces hardcoded `CLASSES` array
- [ ] **SUPA-04**: On cart checkout submit: order written to Supabase `orders` table (customer_name, customer_whatsapp, items jsonb, total_amount, payment_status='pending') before wa.me link opens
- [ ] **SUPA-05**: On class booking submit: booking written to Supabase `bookings` table (class_id, customer_name, customer_whatsapp, seats, mode_preference, message, payment_status='pending') before wa.me link opens
- [ ] **SUPA-06**: RLS policies enabled on `orders` and `bookings` tables — anon role can INSERT only; no SELECT/UPDATE/DELETE without auth

### WhatsApp Checkout

- [ ] **WA-01**: Cart checkout builds a `wa.me` URL with `VITE_WHATSAPP_NUMBER`, pre-filled message containing item names, quantities, ₹ totals, and customer name — opens after successful Supabase write
- [ ] **WA-02**: Class booking builds a `wa.me` URL with `VITE_WHATSAPP_NUMBER`, pre-filled message containing class name, date/time, seats, mode preference, and customer name — opens after successful Supabase write
- [ ] **WA-03**: WhatsApp number always read from `VITE_WHATSAPP_NUMBER` env var — never hardcoded

### Mobile Polish

- [ ] **PLSH-01**: Product grid renders 2 columns on phones (≤640px), 3 columns on tablet (641–1024px), 4 columns on desktop (>1024px)
- [ ] **PLSH-02**: Classes grid renders 1 column on phones, 2 columns on tablet and above
- [ ] **PLSH-03**: Loading skeleton cards displayed while products load from Supabase
- [ ] **PLSH-04**: Loading skeleton cards displayed while classes load from Supabase
- [ ] **PLSH-05**: SEO meta tags — `<title>` and `<meta name="description">` set per page
- [ ] **PLSH-06**: OG tags — `og:title`, `og:description`, `og:image` in `<head>` for social sharing

### Vercel Deploy

- [ ] **DEPL-01**: GitHub repository connected to Vercel with auto-deploy on push to `main`
- [ ] **DEPL-02**: All three env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`) set in Vercel project settings
- [ ] **DEPL-03**: Production deployment verified — all routes load without 404, cart persists across refresh, WhatsApp links open correctly on Android and iOS
- [ ] **DEPL-04**: `README.md` with local setup instructions, env var reference, and Vercel deployment steps

## v2 Requirements

### Payments

- **PAY-01**: Razorpay payment gateway integration — deferred until GST registration
- **PAY-02**: `payment_status` column update flow (pending → paid) after Razorpay webhook

### Content Management

- **CMS-01**: Newsletter email capture — write to Supabase subscribers table
- **CMS-02**: Instagram strip dynamic tiles — Supabase `instagram_posts` table
- **CMS-03**: Inventory management UI for Cordeelia beyond Supabase table editor

### User Accounts

- **AUTH-01**: Customer login / order history
- **AUTH-02**: Wishlist / saved items

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment gateway (Razorpay) | Not GST-registered; deferred — `payment_status` column future-proofs the schema |
| Custom admin dashboard | Cordeelia uses Supabase table editor; saves a full phase |
| Newsletter email capture | Static form in v1; no email service configured |
| Instagram strip dynamic fetch | Static SVG tiles are sufficient for v1 |
| User accounts / auth | No login required for WhatsApp checkout flow |
| SSR / Next.js | Pure SPA on Vercel is sufficient |
| Wishlists, reviews, coupons | Not requested for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCAF-01 | Phase 1 | Pending |
| SCAF-02 | Phase 1 | Pending |
| SCAF-03 | Phase 1 | Pending |
| SCAF-04 | Phase 1 | Pending |
| SCAF-05 | Phase 1 | Pending |
| SCAF-06 | Phase 1 | Pending |
| SUPA-01 | Phase 2 | Pending |
| SUPA-02 | Phase 2 | Pending |
| SUPA-03 | Phase 2 | Pending |
| SUPA-04 | Phase 2 | Pending |
| SUPA-05 | Phase 2 | Pending |
| SUPA-06 | Phase 2 | Pending |
| WA-01 | Phase 2 | Pending |
| WA-02 | Phase 2 | Pending |
| WA-03 | Phase 2 | Pending |
| PLSH-01 | Phase 3 | Pending |
| PLSH-02 | Phase 3 | Pending |
| PLSH-03 | Phase 3 | Pending |
| PLSH-04 | Phase 3 | Pending |
| PLSH-05 | Phase 3 | Pending |
| PLSH-06 | Phase 3 | Pending |
| DEPL-01 | Phase 4 | Pending |
| DEPL-02 | Phase 4 | Pending |
| DEPL-03 | Phase 4 | Pending |
| DEPL-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-06*
*Last updated: 2026-05-06 after initial definition*

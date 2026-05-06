# Cordy's Crafts

## What This Is

A static single-page e-commerce website for Cordy's Crafts, a handmade crafts brand run by Cordeelia in India. The site lets customers browse and purchase handmade goods (paper crafts, clay, candles) and book small-group workshops — all orders and bookings routed to Cordeelia via WhatsApp, with no payment gateway in v1.

## Core Value

A customer on a phone can browse the full catalogue, add items to cart, and place an order that lands in Cordeelia's WhatsApp — all in under a minute.

## Requirements

### Validated

- ✓ Full design system and UI prototype implemented — existing (Claude Design handoff: `index.html`, `primitives.jsx`, `hero.jsx`, `products.jsx`, `sections.jsx`, `colors_and_type.css`)
- ✓ WhatsApp order flow designed (cart → form → wa.me link)
- ✓ WhatsApp booking flow designed (class → form → wa.me link)
- ✓ 4 product categories defined: Paper Crafts, Clay, Candles, Classes & Events
- ✓ Supabase table schemas defined (products, classes, orders, bookings)

### Active

- [ ] Migrate Claude Design prototype into Vite 5 + React + React Router v6 project structure
- [ ] Fetch products and classes dynamically from Supabase
- [ ] Write orders to Supabase `orders` table on WhatsApp checkout
- [ ] Write bookings to Supabase `bookings` table on WhatsApp booking
- [ ] Mobile-first responsive layout (most visitors on phones)
- [ ] Loading skeleton states for product and class grids
- [ ] SEO/OG meta tags (title, description, og:image per page)
- [ ] Vercel deployment with SPA routing fallback (`vercel.json`)
- [ ] Environment variable wiring (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`)

### Out of Scope

- Payment gateway (Razorpay) — not GST-registered yet; `payment_status` column added to future-proof, integration deferred
- Custom admin dashboard — Cordeelia manages products/classes via Supabase table editor
- Newsletter email capture — form is a static placeholder in v1
- Instagram strip dynamic fetch — static SVG tiles with @cordyscrafts link
- Server-side rendering / Next.js — pure SPA on Vercel is sufficient
- User accounts / login — no auth in v1
- Wishlists, reviews, coupons — deferred

## Context

- The UI prototype lives at the repo root as a Babel/CDN `index.html` — it renders correctly in a browser but is not a buildable Vite project. Phase 1 migrates this into a proper Vite scaffold without rewriting any components.
- All design tokens live in `colors_and_type.css` — CSS variable names must not be changed.
- SVG assets in `assets/` and `assets/products/` must not be renamed or moved.
- The Supabase client must live only in `src/lib/supabase.js` — never instantiated elsewhere.
- `VITE_WHATSAPP_NUMBER` is always read from env — never hardcoded.
- Indian market: all prices in ₹ (INR), WhatsApp is primary communication channel.
- Razorpay will be added in a future milestone — `orders.payment_status` (default `'pending'`) and `bookings.payment_status` (default `'pending'`) must exist from day one.

## Constraints

- **Tech stack**: React + Vite 5, Supabase, React Router v6, Vercel — non-negotiable
- **Design**: Must preserve all Claude Design components, tokens, and SVG assets exactly — no rewrites
- **Mobile-first**: Most visitors on phones; mobile layout is the primary target
- **Currency**: All prices in ₹ (INR) — no $ or €
- **Payments**: No payment processing in v1 — WhatsApp → UPI flow only
- **Supabase**: Single client in `src/lib/supabase.js`; env vars for URL and anon key
- **Env vars**: `VITE_WHATSAPP_NUMBER` never hardcoded

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No payment gateway in v1 | Not GST-registered; Cordeelia issues UPI links manually on WhatsApp | — Pending |
| Supabase over Firebase | Already chosen by client; table schemas defined | — Pending |
| Vercel SPA hosting | Auto-deploy from GitHub; `vercel.json` rewrites handle React Router | — Pending |
| Static newsletter + Instagram strip | Reduces scope; no CMS needed for v1 | — Pending |
| No admin UI | Cordeelia uses Supabase table editor directly; saves a full phase of work | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-06 after initialization*

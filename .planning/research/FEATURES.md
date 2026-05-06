# Feature Landscape: Cordy's Crafts

**Domain:** Handmade-goods e-commerce + workshop booking, Indian mobile users, WhatsApp checkout
**Researched:** 2026-05-06
**Confidence:** MEDIUM — no live web search available; findings based on codebase analysis, project documentation, and domain knowledge of Indian mobile commerce patterns. Flag with LOW where specifically uncertain.

---

## Context: What Already Exists

The Claude Design prototype already implements these features — they are NOT to-do items, they are the baseline:

| Feature | Status in Prototype | Notes |
|---------|---------------------|-------|
| Product grid with category tabs | Built | 4 categories, 12 products |
| Cart drawer (slide-in from right) | Built | Qty controls, remove, running total |
| Cart → form → confirmation 3-step flow | Built | Name + WhatsApp number + optional address |
| WhatsApp CTA button (`#25D366` green) | Built | "Place Order via WhatsApp" |
| Booking modal | Built | Seats stepper, online/offline toggle, notes field |
| Booking → confirmation flow | Built | Name + number + seats |
| Class cards with date/time/seats/mode | Built | 8 classes, online + offline + both modes |
| +91 prefix locked in phone fields | Built | Strips non-digits, max 10 chars |
| INR formatting (`₹` via `en-IN` locale) | Built | `inr()` helper throughout |
| About / Newsletter / Instagram strip / Footer | Built | Static, non-interactive |

**Everything below is analysis of what must still be wired up, what is missing, and what should never be built.**

---

## Table Stakes

Features Indian mobile users expect. Missing any of these causes abandonment or breaks trust.

| Feature | Why Expected | Complexity | Current State |
|---------|--------------|------------|---------------|
| Cart persists across page reload | Users browse on mobile, get distracted, come back — if cart is empty they leave | Low | **Missing.** Cart is in-memory only. Fix: sync to `localStorage` on every cart mutation, rehydrate on mount. |
| WhatsApp deep-link actually opens WhatsApp | The "Send order" button must open `wa.me/91XXXXXXXXXX?text=...` with a pre-filled message | Low | **Not wired.** Prototype clears cart and shows confirmation but no `window.open` or `<a href>` to wa.me. |
| Order stored to Supabase before WhatsApp redirect | If user closes WhatsApp before sending, or Cordeelia can't find the chat — order is lost | Low | **Missing.** Required by PROJECT.md; `orders` table schema exists. |
| Booking stored to Supabase before WhatsApp redirect | Same as above for bookings | Low | **Missing.** `bookings` table schema exists. |
| Product/class data from Supabase, not hardcoded | Without this, Cordeelia can't update stock, prices, or add new items without a code deploy | Medium | **Missing.** Products and classes are hardcoded arrays in `products.jsx`. |
| Loading skeleton states | On a slow Indian mobile connection (4G/3G), a blank grid looks broken — skeletons signal "content coming" | Low | **Missing.** Required by PROJECT.md. |
| Mobile-responsive grid and modals | A 4-column product grid at 360px width is unusable. Modal at 520px overflows on small phones | Medium | **Missing.** Grid columns and modal width are hardcoded. Cart drawer is `460px maxWidth: 100vw` which is correct. |
| Inventory / availability signal | If a class is full or a product is sold out, the CTA must say so and disable booking/add-to-cart | Low | **Partial.** `seats` count exists on classes; no `in_stock` field on products; no UI enforcement. |
| Phone number validation with error message | Pattern attribute exists but JS does not show an inline error — user can submit and nothing happens | Low | **Missing.** Silent failure on invalid phone. |
| Delivery address optional but clearly labelled | Indian users order to home addresses, PO boxes, or sometimes pick up locally — they need to know what to write | Done | **Already labelled** "Delivery address or note (optional)". Good. |

---

## Differentiators

Features that build trust and brand identity for a small handmade studio. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Pre-filled WhatsApp message with order summary | When WhatsApp opens, the message body already lists item names, quantities, total, and customer name — zero effort for the customer to send | Low | This is the #1 WhatsApp commerce pattern in India. Format: "Hi Cordeelia! I'd like to order:\n• 2× Rose Garden Soy Candle (₹650)\nTotal: ₹1,300\nName: Priya · +91 98765 43210\nAddress: 12 MG Road, Bengaluru" |
| "Low stock" / "Almost full" urgency tags | Handmade items are genuinely scarce — signalling limited availability is honest and effective | Low | Prototype already has a `tag: 'Low stock'` field on products. Needs to be driven by Supabase `stock_qty` column. |
| "Made to order" tag with lead time | Customers booking a made-to-order item need to know turnaround (e.g. "Ships in 7–10 days") | Low | Prototype has `tag: 'Made to order'` on `c04`. The blurb field can carry lead time. |
| WhatsApp number prefilled in confirmation screen | After the "done" screen, show a "Chat with Cordeelia" button linking directly to her WhatsApp — allows follow-up questions without re-ordering | Low | Reinforces the personal brand. Just an `<a href="wa.me/...">` on the confirmation card. |
| Class "Kit will be posted" callout for online | Zoom classes include a physical kit — this is a strong differentiator vs generic online classes. It needs to be prominent, not buried in a blurb. | Low | Already in class blurb ("kit posted before class") but not visually prominent. |
| Category filtering that persists in URL hash | On mobile, users share product pages. `#candles` or `#clay` in the URL lets Cordeelia share a deep link from Instagram | Low | No URL routing for categories currently. React Router v6 is in the stack — a hash or route param is trivial. |
| "What's in the kit" expandable for classes | First-time workshop buyers don't know what supplies they need or what they'll take home. An accordion or modal section answering this removes the main objection to booking. | Low | Not currently in prototype. Add as optional metadata field on classes. |
| Cordeelia's face / studio photography section | "Hi, I'm Cordeelia" section exists and is effective. Personalisation is the main reason someone buys handmade over Amazon. | Done | Already built in `About` component. Don't touch it. |

---

## Anti-Features

Things to explicitly NOT build in v1. Each one is a trap.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Razorpay / payment gateway | Not GST-registered. Legal and compliance complexity outweighs benefit. Cordeelia issues UPI links manually on WhatsApp and this works for her current volume. | Keep `payment_status: 'pending'` column as the hook for future integration. Ship v1 without it. |
| User accounts / login | No repeat-purchase value in v1. Auth adds a full phase of work, password reset emails, session management. First-time buyers on mobile won't create accounts. | Identify customers by WhatsApp number. Order history is in Cordeelia's WhatsApp and Supabase `orders` table. |
| Wishlists | Requires auth. Adds state complexity. Mobile users just screenshot things they like. | Save cart to localStorage — that is the "wishlist" for this audience. |
| Reviews / ratings | Requires auth, moderation, abuse prevention. Cordeelia is a one-person studio — she can respond personally. | Embed Instagram feed showing customer photos. The existing Instagram strip already handles social proof. |
| Coupon / discount codes | Requires pricing logic, redemption tracking, misuse prevention. Cordeelia can share special pricing ad-hoc on WhatsApp. | Static "DM for bulk pricing" line in footer or on product page is sufficient. |
| Newsletter email integration (Mailchimp, etc.) | Newsletter form is already static placeholder by design. Integrating an ESP adds configuration, API keys, GDPR-adjacent concerns for Indian users. | Keep the form as a static "coming soon" UI or wire it to a simple Supabase `newsletter_signups` table with no outbound sending in v1. |
| Admin dashboard | Would be a full separate product. Cordeelia is technical enough to use Supabase table editor. | Let Supabase UI be the admin panel. Document which columns she should edit. |
| Infinite scroll / pagination | 12 products fit comfortably on one mobile screen with category tabs. Virtualization is over-engineering for this catalog size. | Simple category tab filter. Only add pagination if the catalog grows past ~40 items. |
| Product detail pages / routing per product | For 12 SKUs, the product card blurb (`Hand-stamped on cotton card · A6`) is sufficient. Full pages add routing complexity and duplicate content. | If Cordeelia adds a product that genuinely needs a long description (e.g. a framed art piece), extend the blurb field first. |
| Multi-currency or international shipping | Cordeelia ships within India. Multi-currency adds complexity and sets incorrect expectations. | ₹ only. If an international order comes in via WhatsApp, she handles it manually. |

---

## WhatsApp Commerce Patterns That Work in India

Confidence: MEDIUM (domain knowledge; no live sources consulted due to tool restriction).

### Pattern 1: Pre-filled Message as the Order Form

The wa.me link format that Indian WhatsApp commerce sites use:

```
https://wa.me/91XXXXXXXXXX?text=Hi%20Cordeelia!%20I%27d%20like%20to%20order%3A%0A%E2%80%A2%202%C3%97%20Rose%20Garden%20Soy%20Candle%20%28%E2%82%B950%29%0A...
```

The form submission in the `CartDrawer` should:
1. Build this pre-filled text from `c.items`, `c.total()`, `form.name`, `form.phone`, `form.addr`
2. Write the order record to Supabase `orders` table
3. Open the wa.me link in a new tab (or same tab on mobile)
4. Show the confirmation screen

**Why this matters:** If the customer opens WhatsApp and sees a blank chat, friction is high and many don't send. Pre-filled = one tap.

### Pattern 2: WhatsApp Number as Identity

Indian buyers are comfortable giving their WhatsApp number as the primary contact. It is simultaneously their phone number, order tracking channel, and payment receipt channel. The prototype correctly treats it as the only required contact field (alongside name). Do not add email as required.

### Pattern 3: UPI Link Sent on WhatsApp

The payment flow Cordeelia uses — she sends a UPI link or QR code on WhatsApp after confirming the order — is the dominant small-business payment pattern in India. The confirmation screen ("She'll contact you on WhatsApp to confirm and share a payment link") accurately describes this. Do not add any payment UI in v1; the copy is already correct.

### Pattern 4: Trust Signals Before Checkout

Indian mobile users unfamiliar with a site need trust signals before entering their number. The prototype already has:
- Cordeelia's name and story in the About section
- "600+ pieces made by hand" stats
- Instagram handle (@cordyscrafts)
- The WhatsApp brand colour (`#25D366`) on the CTA

What is missing: an explicit "What happens after I tap?" explanation near the CTA. A single sentence — "Cordeelia will WhatsApp you within a few hours to confirm" — on the cart total panel would close this gap. The prototype already has "Shipping + payment confirmed on WhatsApp" in small print, which is close enough for v1.

### Pattern 5: Mobile-Specific WhatsApp Button Placement

On mobile, the add-to-cart or "Book now" button should be:
- Thumb-reachable (bottom third of screen)
- Full-width or nearly full-width
- The `#25D366` WhatsApp green (already used in prototype)

The cart drawer CTA at the bottom of the panel is correctly positioned. The class card "Book a spot" button needs to be reviewed for mobile tap target size (min 48px height).

---

## Class Booking Flow Analysis

The existing booking modal is well-designed. These are the gaps and the one thing to protect:

**Gaps:**
- No `wa.me` deep-link on submit — same gap as cart. The form currently just advances to a "done" screen without opening WhatsApp or writing to Supabase.
- No seat availability enforcement from live Supabase data — `klass.seats` is a hardcoded max but doesn't reflect actual bookings remaining.
- No handling for fully-booked classes — the "Book a spot" button should become "Join waitlist" or be disabled when `seats_remaining = 0`.

**What works and must be preserved:**
- The online/offline toggle when `mode === 'Both'` is elegant. Don't change it.
- Seat stepper with `Math.min(klass.seats, ...)` upper-bounding is correct.
- The confirmation panel showing name, phone, seats, mode, and total is clear.

**Waitlist as a differentiator:**
For popular classes that sell out, a "Join waitlist" path that captures name + number (same form, different CTA label and Supabase write to a `waitlist` table) would be low-effort and high-value for Cordeelia. She already has the WhatsApp channel to notify waitlisted customers. This is a post-v1 feature but worth noting.

---

## Mobile-First Product Browsing

**Critical fixes (table stakes):**

1. **4-column grid on mobile** — `products.jsx:231` has `gridTemplateColumns` hardcoded to 4 columns. At 360px viewport width, each card is 72px wide — unusable. Must become 2-column on mobile, 4-column on desktop. CSS Grid `auto-fill` with `minmax(160px, 1fr)` handles this responsively.

2. **Category tab bar** — On mobile, the category tabs should be a horizontally scrollable pill row with `overflow-x: auto; white-space: nowrap`, not a wrapping flex container. This is how Meesho, Nykaa, and every major Indian shopping app handles categories on small screens.

3. **Product card tap target** — "Add to cart" button inside the product card needs minimum 44px height for iOS tap guidelines, 48px for Android Material guidelines. Check current card layout.

4. **Image lazy loading** — `loading="lazy"` on all product images below the fold. This is especially important on Indian mobile connections. Already flagged in CONCERNS.md but worth repeating as a table-stakes UX concern.

**Nice to have (differentiator):**

5. **Sticky cart badge on mobile** — A floating cart icon with item count, fixed to bottom-right, that opens the cart drawer. On desktop, the header cart icon is sufficient. On mobile, users scroll past the header and lose access to the cart. The prototype has `window.openCart` already wired — a FAB that calls it would be low-effort.

---

## Feature Dependencies

```
Supabase dynamic fetch → Product/class data correct
Supabase dynamic fetch → Inventory/seats availability
Supabase orders write → WhatsApp redirect (must happen before redirect)
Supabase bookings write → WhatsApp redirect (must happen before redirect)
Cart localStorage sync → Cart persistence across reload
wa.me deep-link → WhatsApp pre-filled message
WhatsApp pre-filled message → Order summary string builder
```

The critical path for a working end-to-end order:
```
Product browsed (Supabase) → Add to cart → Cart drawer → Form → 
  [Parallel] Write to Supabase orders + Build wa.me link → 
  Open WhatsApp → Show confirmation screen
```

---

## MVP Recommendation

### Must have for launch (v1)

1. Cart persistence via `localStorage` — prevents abandoned carts on page reload
2. `wa.me` deep-link with pre-filled message on both order submit and booking submit
3. Supabase write to `orders` and `bookings` tables on submit (before redirect)
4. Supabase dynamic fetch for products and classes (so Cordeelia can manage catalog without code deploy)
5. Mobile-responsive grid (2-col on mobile, 4-col on desktop)
6. Loading skeleton states while Supabase data loads
7. Phone validation with visible error message
8. Inventory signal: `in_stock` flag on products, `seats_remaining` on classes — disable CTA when unavailable

### Defer post-launch

- Waitlist for full classes
- Category filter deep-link via URL hash
- Floating cart FAB on mobile
- "What's in the kit" accordion on class cards
- `wa.me` "Chat with Cordeelia" button on confirmation screens (nice but not critical)
- Newsletter email integration

### Never build (v1 and likely v2)

- Payment gateway (until GST registered)
- User accounts
- Admin dashboard
- Reviews, wishlists, coupons

---

## Gaps to Address

- **Supabase table schemas** — The schemas are described as "defined" in PROJECT.md but were not visible in this research pass. The `in_stock` column on `products` and `seats_remaining` (derived or stored) on `classes` need to be confirmed before the Supabase integration phase.
- **wa.me URL encoding** — The pre-filled message must be URI-encoded. Special characters in product names (e.g. `Lavender & Honey 3-wick`) will break the link if not encoded. This is a known gotcha that must be tested across iOS Safari and Android Chrome.
- **WhatsApp link behaviour on desktop** — `wa.me` links open WhatsApp Web on desktop. Some users may not have WhatsApp Web configured. The form should explain this or offer a fallback. Low priority for an Indian mobile-primary audience but worth noting.

---

## Sources

- Codebase analysis: `sections.jsx`, `products.jsx`, `index.html` (2026-05-06)
- Project context: `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md` (2026-05-06)
- Domain knowledge: Indian mobile e-commerce patterns, WhatsApp Business commerce patterns, wa.me URL spec — MEDIUM confidence, no live sources consulted due to WebSearch tool restriction in this environment

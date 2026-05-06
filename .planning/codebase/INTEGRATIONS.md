# External Integrations

**Analysis Date:** 2026-05-06

## APIs & External Services

**WhatsApp:**
- Service: WhatsApp Business API integration via direct chat link
- What it's used for: Order placement and class booking confirmations
  - Client forms collect user phone number (validated as 10-digit Indian format, prefixed with +91)
  - "Place Order via WhatsApp" button (`sections.jsx`, line 277) opens WhatsApp with pre-filled message
  - "Send booking request" button (`sections.jsx`, line 448) sends class booking via WhatsApp
  - SDK/Client: Native browser WhatsApp link (`https://wa.me/[PHONE_NUMBER]`)
  - Phone number: `VITE_WHATSAPP_NUMBER` environment variable (see `sections.jsx` lines 287, 335, 462)
  - Special constraint per CLAUDE.md: "VITE_WHATSAPP_NUMBER is always read from env vars — never hardcoded"

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
  - Status: Configuration present, actual usage/queries not yet implemented in visible code
  - Constraint per CLAUDE.md: "Supabase client lives only in `src/lib/supabase.js` — never initialised elsewhere"
  - Note: `src/lib/supabase.js` does not yet exist in codebase (pre-implementation stage)

**File Storage:**
- Local filesystem only
  - Static assets served from `assets/` directory
  - User-uploaded content (if any) stored in `uploads/` directory (structure present, not yet used)

**Caching:**
- None (client-side state only via React)
- Cart stored in `window.cart` global object (`products.jsx`, lines 4-31)
- Form data stored in React component state

## Authentication & Identity

**Auth Provider:**
- Custom implementation (none detected)
- Supabase auth anticipated (env vars configured) but not yet implemented
- Current approach: Phone number collection + WhatsApp verification (manual)

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console only
- No centralized logging service configured

## CI/CD & Deployment

**Hosting:**
- Not configured (deployment target TBD)
- Recommended: Static hosting (GitHub Pages, Netlify, Vercel)

**CI Pipeline:**
- Not detected

## Environment Configuration

**Required env vars:**
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_WHATSAPP_NUMBER=919876543210
```

**Secrets location:**
- `.env.local` (local development, in `.gitignore`)
- Per constraint: VITE_WHATSAPP_NUMBER read from env only, never hardcoded

## Webhooks & Callbacks

**Incoming:**
- Not implemented
- WhatsApp messages to configured phone number (manual review by Cordeelia)

**Outgoing:**
- Not implemented
- Potential: Order/booking confirmation emails via Supabase Edge Functions (not yet added)

## Currency & Localization

**Currency:**
- Indian Rupees (₹) exclusively
- Helper function: `inr(amount)` formats as `₹` + locale string (`products.jsx`, line 44)
- Constraint per CLAUDE.md: "All prices must be in Indian Rupees (₹) — never $ or €"

## Form Data Handling

**Cart Checkout:**
- Customer data collected:
  - Name
  - WhatsApp number (10 digits, validated pattern `[0-9]{10}`)
  - Delivery address (optional)
- Data submitted to WhatsApp link with pre-filled message
- No backend persistence yet (manual processing)

**Class Booking:**
- Customer data collected:
  - Name
  - WhatsApp number (validated as above)
  - Number of seats
  - Preference (Online/Offline if applicable)
  - Optional message/note
- Data submitted to WhatsApp link
- Pricing calculated client-side based on seat count and class price

## Data Flow

**Order Placement:**
1. User adds items to cart (stored in `window.cart` object)
2. Opens cart drawer
3. Proceeds to checkout form
4. Enters name, phone, address
5. Clicks "Send order to Cordeelia"
6. WhatsApp message generated with order summary
7. Cordeelia receives and processes manually

**Class Booking:**
1. User selects class (ClassCard component triggered via `onBook` callback)
2. Opens BookingModal with class details
3. Enters name, phone, seats, preference, notes
4. Clicks "Send booking request"
5. WhatsApp message generated with booking details
6. Cordeelia receives and confirms via WhatsApp with payment link

---

*Integration audit: 2026-05-06*

# Cordy's Crafts

Handmade crafts e-commerce site — browse paper crafts, clay, and candles, and book small-group workshops. Orders and bookings go straight to Cordeelia via WhatsApp; no payment gateway in v1.

## What It Is

React 18 + Vite 5 single-page app backed by Supabase. Customers browse the catalogue, add items to cart, and place orders via a pre-filled WhatsApp message. Built for the Indian market — all prices in ₹ (INR).

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- A code editor (VS Code recommended)

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/cordycrafts.git
   cd cordycrafts
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the env var template:

   ```bash
   cp .env.example .env.local
   ```

4. Open `.env.local` and fill in the three values (get these from Cordeelia):

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_WHATSAPP_NUMBER=919876543210
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

   The site runs at `http://localhost:5173`.

## Environment Variables

| Variable | Description | Where to find it |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API → anon public key |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for orders/bookings (digits only, with country code, no `+`) | Ask Cordeelia |

All three values are required. The app throws a startup error listing any missing variable.

> **Note:** Use `.env.local` (not `.env`). Vite loads `.env.local` for local development and it is git-ignored by default.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18.3 |
| Build tool | Vite 5 |
| Database | Supabase (PostgreSQL + RLS) |
| Hosting | Vercel |
| Styling | CSS custom properties (`colors_and_type.css`) + inline styles |

## Project Structure

```
src/
  primitives.jsx     # Reusable UI atoms — Icon, Logo, Button, CircleBadge
  hero.jsx           # Nav and Hero section
  products.jsx       # ProductGrid, ClassesGrid, and data hooks
  sections.jsx       # CartDrawer, BookingModal, About, Footer
  CartContext.jsx    # Cart state (useReducer + localStorage)
  App.jsx            # Root component
  main.jsx           # Entry point, env validation
  lib/
    supabase.js      # Supabase client (single instance)
    whatsapp.js      # wa.me URL builder
  hooks/
    useProducts.js   # Fetches products from Supabase
    useClasses.js    # Fetches classes from Supabase
    useBreakpoint.js # Responsive breakpoint hook
```

## Deployment

Deployed on Vercel at `https://cordyscrafts.vercel.app`. Auto-deploys from the `main` branch — push a commit to main and Vercel builds and deploys automatically.

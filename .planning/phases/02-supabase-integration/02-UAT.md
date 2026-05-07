---
status: passed
phase: 02-supabase-integration
source: [02-00-SUMMARY.md, 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md]
started: 2026-05-07T20:45:00Z
updated: 2026-05-07T21:30:00Z
---

## Current Test

number: ~
name: ~
awaiting: ~

## Tests

### 1. Cold Start — Products Load from Supabase
expected: Kill any running dev server. Start fresh with `npm run dev`. The product grid section renders 12 products fetched from your live Supabase DB — not hardcoded. While loading, the grid area is blank (no skeleton yet). Once loaded, all three category filter buttons (Paper Crafts, Clay, Candles) appear and work.
result: passed

### 2. Classes Load from Supabase
expected: The classes/workshops section below the product grid shows 8 classes fetched from Supabase. Filter buttons (All, Paper Crafts, Clay, Candles, Online, Offline) all filter correctly against live data.
result: passed

### 3. Booking Modal Header Shows Date
expected: Click "Book Now" on any class. The modal header subtitle shows the class date cleanly — e.g. "Sat 23 May 2026 · 2.5 hrs · ₹1,200/person". No "undefined" visible anywhere in the header.
result: passed

### 4. Order Checkout — Happy Path
expected: Add a product to cart. Open cart, fill in name, WhatsApp number, and address. Click Send Order. Two things happen: (1) a new row appears in your Supabase `orders` table with payment_status='pending', and (2) your WhatsApp app opens with a pre-filled message listing the item(s), quantities, ₹ totals, and customer name.
result: passed

### 5. Order Checkout — WhatsApp Message Format
expected: The wa.me message for an order follows this structure:
  New Order
  Name: {your name}
  Phone: {your number}
  Address: {your address}

  Items:
  - {product name} x1 ₹{price}

  Total: ₹{price}
result: passed

### 6. Order Failure Guard
expected: Edit the "anon insert orders" policy in Supabase to `WITH CHECK (false)`. Try submitting an order. The Send Order button spins, then a red error line appears below it saying "Something went wrong — please try again." The WhatsApp app does NOT open. Restore the policy to `WITH CHECK (true)` afterwards.
result: passed

### 7. Booking — Happy Path
expected: Click Book Now on a class, fill in the form (name, phone, seats, mode preference), and submit. A new row appears in your Supabase `bookings` table with the correct `class_id` UUID (not a SKU string) and payment_status='pending'. WhatsApp opens with a message that includes the class name, date, your details, and seat count.
result: passed

### 8. Booking WhatsApp Message Includes Date
expected: The booking wa.me message contains a "Date:" line matching the class's date_label, e.g.:
  New Booking
  Class: Card Making with Stamps & Stencils
  Date: Sat 23 May 2026
  Name: {name}
  ...
result: passed

### 9. RLS — Anon Cannot Read Orders
expected: In browser DevTools console run:
  import('/src/lib/supabase.js').then(m => m.supabase.from('orders').select('*').then(console.log))
  Result should be: { data: [], error: null, status: 200 }
  An empty array — NOT the actual order rows you placed. RLS blocks anon SELECT.
result: passed

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]

-- Cordy's Crafts — Phase 2 schema bootstrap
-- Apply via: supabase db push  (or paste into Supabase Dashboard → SQL Editor)
-- Creates products, classes, orders, bookings tables with RLS policies per SUPA-06.

-- ============================================================================
-- products
-- ============================================================================
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  sku         text not null unique,
  name        text not null,
  category    text not null,
  price       integer not null,
  img         text not null,
  tag         text,
  accent      text,
  created_at  timestamptz not null default now()
);

alter table products enable row level security;

create policy "public read products"
  on products for select to anon
  using (true);

-- ============================================================================
-- classes
-- ============================================================================
create table if not exists classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  subtitle    text,
  price       integer not null,
  img         text not null,
  date_label  text,
  seats_left  integer,
  duration    text,
  mode        text,
  created_at  timestamptz not null default now()
);

alter table classes enable row level security;

create policy "public read classes"
  on classes for select to anon
  using (true);

-- ============================================================================
-- orders
-- ============================================================================
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  customer_name     text not null,
  customer_whatsapp text not null,
  address           text not null,
  items             jsonb not null,
  total_amount      integer not null,
  payment_status    text not null default 'pending',
  created_at        timestamptz not null default now()
);

alter table orders enable row level security;

-- anon can INSERT only — no SELECT/UPDATE/DELETE policy means those are implicitly denied
create policy "anon insert orders"
  on orders for insert to anon
  with check (true);

-- ============================================================================
-- bookings
-- ============================================================================
create table if not exists bookings (
  id                uuid primary key default gen_random_uuid(),
  class_id          uuid not null references classes(id),
  customer_name     text not null,
  customer_whatsapp text not null,
  seats             integer not null,
  mode_preference   text,
  message           text,
  payment_status    text not null default 'pending',
  created_at        timestamptz not null default now()
);

alter table bookings enable row level security;

create policy "anon insert bookings"
  on bookings for insert to anon
  with check (true);

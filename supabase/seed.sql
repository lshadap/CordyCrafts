-- Cordy's Crafts — Phase 2 seed data
-- Apply via: supabase db push --include-seed  OR  paste into Supabase SQL Editor after the migration
-- Idempotent: re-running this file is a no-op (ON CONFLICT DO NOTHING).
-- Source: hardcoded PRODUCTS and CLASSES arrays in src/products.jsx (pre-Phase-2)

-- ============================================================================
-- products (12 rows) — keyed by sku
-- ============================================================================
insert into products (sku, name, category, price, img, tag, accent) values
  ('p01', 'Stamped Birthday Card',     'Paper Crafts', 180,  '/assets/products/amigurumi-bear.svg',   'Bestseller',    null),
  ('p02', 'Quilled Floral Frame',      'Paper Crafts', 1450, '/assets/products/scarf.svg',            'Framed',        null),
  ('p03', 'Iris-Folded Card Set',      'Paper Crafts', 420,  '/assets/products/market-bag.svg',       null,            null),
  ('p04', 'Paper Embroidery Hoop',     'Paper Crafts', 980,  '/assets/products/tote.svg',             'New',           null),
  ('c01', 'Air-Dry Clay Trinket Dish', 'Clay',         540,  '/assets/products/coaster-set.svg',      'Set of 2',      null),
  ('c02', 'Polymer Daisy Earrings',    'Clay',         380,  '/assets/products/amigurumi-bunny.svg',  null,            null),
  ('c03', 'Heart Pendant',             'Clay',         320,  '/assets/products/blanket.svg',          null,            null),
  ('c04', 'Mini Planter (set of 3)',   'Clay',         1200, '/assets/products/cardigan.svg',         'Made to order', null),
  ('k01', 'Rose Garden Soy Candle',    'Candles',      650,  '/assets/products/beanie.svg',           null,            null),
  ('k02', 'Vanilla Bean Pillar',       'Candles',      780,  '/assets/products/mug-cozy.svg',         null,            null),
  ('k03', 'Citrus Tin Travel Candle',  'Candles',      320,  '/assets/products/granny-pillow.svg',    null,            null),
  ('k04', 'Lavender & Honey 3-wick',   'Candles',      1480, '/assets/products/plant-hanger.svg',     'Low stock',     null)
on conflict (sku) do nothing;

-- ============================================================================
-- classes (8 rows) — keyed by name (unique constraint added in migration)
-- Note: original hardcoded CLASSES had `time` and `location` fields not in the schema; omitted here per 02-CONTEXT.md.
-- ============================================================================
insert into classes (name, subtitle, category, price, img, date_label, seats_left, duration, mode) values
  ('Card Making with Stamps & Stencils', 'Make 4 keepsake cards. All supplies included.',              'Paper Crafts', 1200, '/assets/products/amigurumi-bear.svg',  'Sat 23 May 2026',       8,  '2.5 hrs', 'Both'),
  ('Quilling 101: Floral Frames',         'Live on Zoom · kit posted before class.',                   'Paper Crafts', 900,  '/assets/products/scarf.svg',           'Sun 31 May 2026',       14, '2 hrs',   'Online'),
  ('Iris Folding Workshop',               'Take home 2 framed iris-folded pieces.',                    'Paper Crafts', 1500, '/assets/products/market-bag.svg',      'Sat 13 Jun 2026',       6,  '3 hrs',   'Offline'),
  ('Polymer Clay Earrings',               'Sculpt, bake, and finish two pairs.',                       'Clay',         1800, '/assets/products/amigurumi-bunny.svg', 'Sun 7 Jun 2026',        8,  '3 hrs',   'Both'),
  ('Air-Dry Clay Pottery (Beginners)',    'Trinket dishes & planters. Group of 3+ to book.',            'Clay',         2200, '/assets/products/coaster-set.svg',     'Flexible / On Request', 6,  '4 hrs',   'Offline'),
  ('Hand-Poured Soy Candles',             'Live on Zoom · DIY kit posted before class.',               'Candles',      1400, '/assets/products/beanie.svg',          'Sat 30 May 2026',       12, '2 hrs',   'Online'),
  ('Beeswax Pillar Workshop',             'Pour, scent, and decorate 2 pillars to take home.',         'Candles',      1900, '/assets/products/mug-cozy.svg',        'Sun 21 Jun 2026',       8,  '3 hrs',   'Offline'),
  ('Paper Embroidery Mini',               'Stitch a 4in hoop on cardstock. 1:1 sessions available.',   'Paper Crafts', 700,  '/assets/products/tote.svg',            'Flexible / On Request', 20, '1.5 hrs', 'Online')
on conflict (name) do nothing;

-- After this seed runs, the live project should report:
--   select count(*) from products;  -- 12
--   select count(*) from classes;   -- 8

---
phase: 02-supabase-integration
plan: "01"
subsystem: database
tags: [supabase, sql, migrations, rls, seed-data]
dependency_graph:
  requires: []
  provides: [supabase/migrations/20260507000000_init_schema.sql, supabase/seed.sql]
  affects: [02-02, 02-03, 02-04]
tech_stack:
  added: [supabase/migrations/, supabase/seed.sql]
  patterns: [supabase-migration-files, rls-insert-only, idempotent-seed-via-on-conflict]
key_files:
  created:
    - supabase/migrations/20260507000000_init_schema.sql
    - supabase/seed.sql
  modified: []
decisions:
  - UNIQUE on products.sku and classes.name to enable ON CONFLICT DO NOTHING idempotent seed
  - accent column set to NULL for all seeded products (boolean accent:true had no hex value — Cordeelia to backfill via table editor)
  - time and location fields omitted from classes seed (not in schema per 02-CONTEXT.md)
metrics:
  duration: "2 min"
  completed_date: "2026-05-07"
  tasks_completed: 2
  tasks_total: 3
  tasks_pending_checkpoint: 0
---

# Phase 2 Plan 01: SQL Schema + Seed Summary

**One-liner:** Postgres DDL for products/classes/orders/bookings tables with RLS policies (SUPA-06) and idempotent seed of 12 products + 8 classes from src/products.jsx.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Author supabase/migrations/20260507000000_init_schema.sql | 2689889 | supabase/migrations/20260507000000_init_schema.sql |
| 2 | Author supabase/seed.sql | eb9f367 | supabase/seed.sql |

## Checkpoint (Task 3)

**Status: APPLIED — developer confirmed 2026-05-07**

Schema and seed applied to live Supabase project via Dashboard SQL Editor. 4 tables created with RLS. 12 products + 8 classes seeded. Note: `ALTER TABLE classes ADD COLUMN category text` was required after initial migration (category column was missing from the original migration file — fixed in commit 59cee23).

## What Was Built

### supabase/migrations/20260507000000_init_schema.sql

Four tables with exact column shapes from 02-CONTEXT.md:

- **products**: id (uuid PK), sku (text NOT NULL UNIQUE), name, category, price (integer), img, tag (nullable), accent (nullable text for hex color override), created_at
- **classes**: id (uuid PK), name (text NOT NULL UNIQUE), subtitle (nullable), price (integer), img, date_label (nullable), seats_left (nullable integer), duration (nullable text), mode (nullable text), created_at
- **orders**: id (uuid PK), customer_name, customer_whatsapp, address, items (jsonb), total_amount (integer), payment_status (text default 'pending'), created_at
- **bookings**: id (uuid PK), class_id (uuid FK → classes.id), customer_name, customer_whatsapp, seats (integer), mode_preference (nullable), message (nullable), payment_status (text default 'pending'), created_at

RLS enabled on all 4 tables with 4 policies satisfying SUPA-06:
- products + classes: public anon SELECT (catalog is public)
- orders + bookings: anon INSERT only — no SELECT/UPDATE/DELETE policy means those are implicitly denied under RLS (PII protection)

### supabase/seed.sql

12 product rows and 8 class rows sourced from `src/products.jsx` hardcoded arrays.

Idempotency:
- Products: `ON CONFLICT (sku) DO NOTHING`
- Classes: `ON CONFLICT (name) DO NOTHING`

Notable decisions in seed:
- `accent` set to NULL for all products — the hardcoded array used `accent: true` (boolean flag) but the schema types it as nullable text for a hex color override. NULL is the correct migration; the "accent badge" will not appear until Cordeelia backfills hex values via Supabase table editor.
- `time` and `location` fields from the original CLASSES array are omitted — these columns do not exist in the schema per 02-CONTEXT.md.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, or file access patterns introduced beyond what is described in the plan's threat_model. The two SQL files contain only public catalog data (no PII, no secrets) and are committed to git as explicitly accepted in T-02-01-06.

## Self-Check

### Files exist:

- supabase/migrations/20260507000000_init_schema.sql: FOUND
- supabase/seed.sql: FOUND

### Commits exist:

- 2689889 (feat(02-01): add init_schema.sql): FOUND
- eb9f367 (feat(02-01): add seed.sql): FOUND

## Self-Check: PASSED

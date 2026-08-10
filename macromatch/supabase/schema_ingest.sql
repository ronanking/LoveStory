-- MacroMatch food-data ingestion schema (Supabase / PostgreSQL)
-- Run in the Supabase SQL editor or via migration tooling.
-- Canonical convention: nutrients stored PER 100 g (or per 100 ml where
-- is_liquid) in SI-ish units: energy kJ, macros g, sodium mg.

create extension if not exists pg_trgm;      -- fuzzy duplicate candidate search
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Sources: the licence gate lives here. Importers refuse to run unless the
-- row exists and licence_cleared = true.
-- ---------------------------------------------------------------------------
create table if not exists food_sources (
  id               text primary key,              -- e.g. 'afcd_r2'
  name             text not null,
  publisher        text not null,
  source_url       text not null,
  licence          text not null,                 -- e.g. 'CC BY 3.0 AU'
  licence_notes    text,
  licence_cleared  boolean not null default false,
  attribution_text text,                          -- what we must display
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Import runs: one row per invocation; checkpointing keys off this.
-- ---------------------------------------------------------------------------
create table if not exists import_runs (
  id             uuid primary key default uuid_generate_v4(),
  source_id      text not null references food_sources(id),
  input_ref      text not null,       -- file path / URL / dump version imported
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  status         text not null default 'running'
                 check (status in ('running','completed','failed','interrupted')),
  last_checkpoint text,               -- last committed batch cursor (resume point)
  stats          jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- Foods: canonical products. (source_id, external_id) is the idempotency key —
-- re-running an import upserts rather than duplicates.
-- ---------------------------------------------------------------------------
create table if not exists foods (
  id                uuid primary key default uuid_generate_v4(),
  source_id         text not null references food_sources(id),
  external_id       text not null,          -- source's stable key (AFCD food key, OFF barcode, ...)
  barcode           text,                    -- GTIN/EAN when known
  name              text not null,
  brand             text,
  category          text,
  is_liquid         boolean not null default false,

  serving_size_desc text,                    -- as published, e.g. '1 burger'
  serving_weight_g  numeric,                 -- grams (or ml for liquids)

  -- canonical nutrients per 100 g / 100 ml
  energy_kj_100     numeric,
  energy_kcal_100   numeric,                 -- derived: kJ / 4.184 unless source-stated
  protein_g_100     numeric,
  carbs_g_100       numeric,
  sugars_g_100      numeric,
  fat_g_100         numeric,
  sat_fat_g_100     numeric,
  sodium_mg_100     numeric,

  -- audit trail: exactly what the source said, untouched, plus provenance
  raw               jsonb not null,          -- original row incl. original units/values
  source_url        text not null,
  source_version    text,                    -- e.g. 'AFCD Release 2.0 (2022)'
  retrieved_at      timestamptz not null,
  last_verified_at  timestamptz not null default now(),

  confidence        text not null default 'unverified'
                    check (confidence in ('verified','unverified','suspect')),
  quality_flags     text[] not null default '{}',   -- e.g. {missing_sodium,energy_mismatch}
  natural_key       text not null,           -- normalised brand|name|serving hash (dedupe)
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (source_id, external_id)
);

create index if not exists foods_natural_key_idx on foods (natural_key);
create index if not exists foods_barcode_idx      on foods (barcode) where barcode is not null;
create index if not exists foods_name_trgm_idx    on foods using gin (name gin_trgm_ops);
create index if not exists foods_confidence_idx   on foods (confidence);

-- ---------------------------------------------------------------------------
-- Review queue: humans resolve what the pipeline refuses to guess.
-- ---------------------------------------------------------------------------
create table if not exists review_queue (
  id          uuid primary key default uuid_generate_v4(),
  food_id     uuid references foods(id) on delete cascade,
  run_id      uuid references import_runs(id),
  reason      text not null,           -- 'energy_mismatch', 'missing_required', 'parse_error', ...
  detail      jsonb not null default '{}'::jsonb,
  status      text not null default 'open'
              check (status in ('open','resolved','dismissed')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text
);
create index if not exists review_open_idx on review_queue (status) where status = 'open';

-- ---------------------------------------------------------------------------
-- Duplicate candidates: fuzzy matches are flagged for a human, never auto-merged.
-- ---------------------------------------------------------------------------
create table if not exists duplicate_pairs (
  id          uuid primary key default uuid_generate_v4(),
  food_a      uuid not null references foods(id) on delete cascade,
  food_b      uuid not null references foods(id) on delete cascade,
  match_type  text not null check (match_type in ('barcode','natural_key','fuzzy')),
  score       numeric,                 -- similarity 0–100 for fuzzy matches
  status      text not null default 'open'
              check (status in ('open','merged','not_duplicate')),
  created_at  timestamptz not null default now(),
  unique (food_a, food_b)
);

-- updated_at trigger
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;
drop trigger if exists foods_updated_at on foods;
create trigger foods_updated_at before update on foods
  for each row execute function set_updated_at();

-- Seed the P0 source (licence text verified against FSANZ copyright page before
-- flipping licence_cleared in production).
insert into food_sources (id, name, publisher, source_url, licence, licence_cleared, attribution_text)
values (
  'afcd_r2',
  'Australian Food Composition Database, Release 2',
  'Food Standards Australia New Zealand',
  'https://www.foodstandards.gov.au/science-data/monitoringnutrients/afcd',
  'CC BY (per FSANZ copyright statement)',
  true,
  'Source: Australian Food Composition Database Release 2, Food Standards Australia New Zealand (FSANZ).'
) on conflict (id) do nothing;

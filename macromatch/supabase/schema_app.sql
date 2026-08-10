-- MacroMatch app-side schema: run AFTER supabase/schema_ingest.sql.
-- Adds (1) the RLS read policy the app needs on `foods`, and (2) the
-- user-facing tables for auth-backed persistence (profiles + diary).

-- ---------------------------------------------------------------------------
-- 1. Foods: anon/authenticated may READ non-suspect rows only.
--    Writes stay service-role-only (the ingestion pipeline).
-- ---------------------------------------------------------------------------
alter table foods enable row level security;

drop policy if exists foods_public_read on foods;
create policy foods_public_read on foods
  for select
  to anon, authenticated
  using (confidence <> 'suspect');

-- Ingestion support tables are not for app clients at all.
alter table food_sources    enable row level security;
alter table import_runs     enable row level security;
alter table review_queue    enable row level security;
alter table duplicate_pairs enable row level security;

-- Attribution must be displayable in the app (e.g. FSANZ credit line).
drop policy if exists sources_public_read on food_sources;
create policy sources_public_read on food_sources
  for select
  to anon, authenticated
  using (licence_cleared = true);

-- ---------------------------------------------------------------------------
-- 2. User profiles: one row per auth user. Targets are user-owned numbers;
--    wizard inputs are stored so "Recalculate" can prefill.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null default 'mate',
  target_kcal     integer not null default 2580 check (target_kcal between 0 and 20000),
  target_p        integer not null default 180  check (target_p between 0 and 2000),
  target_c        integer not null default 285  check (target_c between 0 and 4000),
  target_f        integer not null default 80   check (target_f between 0 and 1500),
  wizard_profile  jsonb,            -- sex/age/height/weight/bodyFat/activity/goal/split
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table profiles enable row level security;
drop policy if exists profiles_own on profiles;
create policy profiles_own on profiles
  for all
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Diary entries: denormalised macro snapshot at log time, so an edit to
--    the foods table never silently rewrites history (audit-friendly, and a
--    custom food needs no foods row at all).
-- ---------------------------------------------------------------------------
create table if not exists diary_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entry_date  date not null,
  meal        text not null check (meal in ('Breakfast','Lunch','Dinner','Snacks')),
  food_id     uuid references foods(id),   -- null for custom foods
  name        text not null,
  venue       text not null default 'Custom',
  kcal        integer not null check (kcal >= 0),
  protein_g   integer not null check (protein_g >= 0),
  carbs_g     integer not null check (carbs_g >= 0),
  fat_g       integer not null check (fat_g >= 0),
  created_at  timestamptz not null default now()
);

create index if not exists diary_user_date_idx on diary_entries (user_id, entry_date);

alter table diary_entries enable row level security;
drop policy if exists diary_own on diary_entries;
create policy diary_own on diary_entries
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- updated_at trigger for profiles (reuses set_updated_at from the ingest schema)
drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

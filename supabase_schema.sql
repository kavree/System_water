-- Supabase schema for the Water Meter app (houses + meter_readings)
-- Copy-paste this entire script into Supabase SQL editor and run.

-- 1) Enable required extension for UUID generation
create extension if not exists "pgcrypto";

-- 2) Tables
create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  house_number text not null,
  owner_name text not null
);

comment on table public.houses is 'Houses registry';
comment on column public.houses.house_number is 'บ้านเลขที่';
comment on column public.houses.owner_name is 'ชื่อเจ้าของบ้าน';

create table if not exists public.meter_readings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  house_id uuid not null references public.houses(id) on delete cascade,
  month_key text not null,
  month text not null,
  previous_reading integer not null check (previous_reading &#62;= 0),
  current_reading integer not null check (current_reading &#62;= 0),
  units_used integer not null check (units_used &#62;= 0),
  total_amount numeric(12,2) not null check (total_amount &#62;= 0),
  date_recorded timestamptz not null default now(),
  meter_image text,
  unique (house_id, month_key),
  check (current_reading &#62;= previous_reading),
  check (month_key ~ '^[0-9]{4}-[0-9]{2}$')
);

comment on table public.meter_readings is 'Monthly meter readings per house';
comment on column public.meter_readings.month_key is 'Key in format YYYY-MM';

-- 3) Performance indexes
create index if not exists idx_meter_readings_house_id on public.meter_readings (house_id);
create index if not exists idx_meter_readings_month_key on public.meter_readings (month_key);

-- 4) Row Level Security (allow public read/write; adjust for your needs)
alter table public.houses enable row level security;
alter table public.meter_readings enable row level security;

-- Drop existing permissive policies if re-running
drop policy if exists "Public read houses" on public.houses;
drop policy if exists "Public insert houses" on public.houses;
drop policy if exists "Public update houses" on public.houses;
drop policy if exists "Public delete houses" on public.houses;

drop policy if exists "Public read meter_readings" on public.meter_readings;
drop policy if exists "Public insert meter_readings" on public.meter_readings;
drop policy if exists "Public update meter_readings" on public.meter_readings;
drop policy if exists "Public delete meter_readings" on public.meter_readings;

-- Permissive policies for frontend anon/authenticated access
create policy "Public read houses" on public.houses
  for select to anon, authenticated
  using (true);

create policy "Public insert houses" on public.houses
  for insert to anon, authenticated
  with check (true);

create policy "Public update houses" on public.houses
  for update to anon, authenticated
  using (true)
  with check (true);

create policy "Public delete houses" on public.houses
  for delete to anon, authenticated
  using (true);

create policy "Public read meter_readings" on public.meter_readings
  for select to anon, authenticated
  using (true);

create policy "Public insert meter_readings" on public.meter_readings
  for insert to anon, authenticated
  with check (true);

create policy "Public update meter_readings" on public.meter_readings
  for update to anon, authenticated
  using (true)
  with check (true);

create policy "Public delete meter_readings" on public.meter_readings
  for delete to anon, authenticated
  using (true);

-- 5) Grants (optional; Supabase usually handles this)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.houses to anon, authenticated;
grant select, insert, update, delete on public.meter_readings to anon, authenticated;

-- End
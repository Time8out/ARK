-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Safe to re-run: creates the table if missing, and adds/fixes columns if it
-- already exists from an earlier version of this script.

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table public.members add column if not exists birthdate date;
alter table public.members add column if not exists phone_number text;
alter table public.members add column if not exists home_address text;
alter table public.members add column if not exists status text not null default 'active';
alter table public.members drop column if exists age;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'members' and column_name = 'member_no'
  ) then
    alter table public.members add column member_no bigint generated always as identity;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'members_status_check'
  ) then
    alter table public.members
      add constraint members_status_check check (status in ('active', 'inactive'));
  end if;
end $$;

alter table public.members enable row level security;

drop policy if exists "Authenticated users can view members" on public.members;
create policy "Authenticated users can view members"
  on public.members for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can add members" on public.members;
create policy "Authenticated users can add members"
  on public.members for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update members" on public.members;
create policy "Authenticated users can update members"
  on public.members for update
  to authenticated
  using (true);

drop policy if exists "Authenticated users can delete members" on public.members;
create policy "Authenticated users can delete members"
  on public.members for delete
  to authenticated
  using (true);

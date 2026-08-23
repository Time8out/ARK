-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Safe to re-run.
-- One "groups" table backs both Groups and Ministries (distinguished by `kind`),
-- plus a join table linking members to groups/ministries.

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('group', 'ministry')),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, member_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

drop policy if exists "Authenticated users can view groups" on public.groups;
create policy "Authenticated users can view groups"
  on public.groups for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can add groups" on public.groups;
create policy "Authenticated users can add groups"
  on public.groups for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update groups" on public.groups;
create policy "Authenticated users can update groups"
  on public.groups for update
  to authenticated
  using (true);

drop policy if exists "Authenticated users can delete groups" on public.groups;
create policy "Authenticated users can delete groups"
  on public.groups for delete
  to authenticated
  using (true);

drop policy if exists "Authenticated users can view group members" on public.group_members;
create policy "Authenticated users can view group members"
  on public.group_members for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can add group members" on public.group_members;
create policy "Authenticated users can add group members"
  on public.group_members for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can remove group members" on public.group_members;
create policy "Authenticated users can remove group members"
  on public.group_members for delete
  to authenticated
  using (true);

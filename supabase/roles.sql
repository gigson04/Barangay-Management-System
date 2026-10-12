-- Run once in the Supabase SQL Editor to enable database-backed roles.
-- Create application accounts in Supabase Authentication. New accounts receive
-- the least-privileged default role; an administrator can change roles below.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'Pending'
    check (role in (
      'Pending',
      'Administrator',
      'Barangay Secretary',
      'Treasurer/Business Personnel',
      'Barangay Officer'
    )),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, update on public.profiles to authenticated;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

-- Business and complaint staff need to link a record to a resident. Expose
-- only the minimum identity fields needed for those selectors.
create or replace function public.resident_reference_options()
returns table (
  id uuid,
  resident_number text,
  first_name text,
  middle_name text,
  last_name text,
  suffix text,
  status text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public.current_user_role() not in (
    'Administrator', 'Barangay Secretary',
    'Treasurer/Business Personnel', 'Barangay Officer'
  ) then
    raise exception 'Not authorized to view resident references';
  end if;
  return query
    select r.id, r.resident_number, r.first_name, r.middle_name,
           r.last_name, r.suffix, r.status
    from public.residents r
    where coalesce(r.status, 'Active') <> 'Inactive'
    order by r.last_name, r.first_name;
end;
$$;

revoke all on function public.resident_reference_options() from public;
grant execute on function public.resident_reference_options() to authenticated;

create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  status text not null,
  assigned_to text,
  resolution text,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

alter table public.complaint_status_history enable row level security;
revoke all on public.complaint_status_history from anon;
grant select on public.complaint_status_history to authenticated;

create or replace function public.log_complaint_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.complaint_status_history
      (complaint_id, status, assigned_to, resolution, changed_by)
    values
      (new.id, new.status, new.assigned_to, new.resolution, auth.uid());
  elsif old.status is distinct from new.status
     or old.assigned_to is distinct from new.assigned_to
     or old.resolution is distinct from new.resolution then
    insert into public.complaint_status_history
      (complaint_id, status, assigned_to, resolution, changed_by)
    values
      (new.id, new.status, new.assigned_to, new.resolution, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists complaint_status_history_trigger on public.complaints;
create trigger complaint_status_history_trigger
  after insert or update of status, assigned_to, resolution on public.complaints
  for each row execute procedure public.log_complaint_status_change();

insert into public.complaint_status_history
  (complaint_id, status, assigned_to, resolution, changed_at)
select c.id, coalesce(c.status, 'Pending'), c.assigned_to, c.resolution,
       coalesce(c.created_at, c.date_filed::timestamptz, now())
from public.complaints c
where not exists (
  select 1 from public.complaint_status_history h where h.complaint_id = c.id
);

drop policy if exists "complaint history read" on public.complaint_status_history;
create policy "complaint history read" on public.complaint_status_history
  for select to authenticated
  using (public.current_user_role() in ('Administrator', 'Barangay Officer'));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- Backfill accounts that existed before this migration.
insert into public.profiles (id, email, full_name)
select id, coalesce(email, ''), coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', split_part(coalesce(email, ''), '@', 1))
from auth.users
on conflict (id) do nothing;

drop policy if exists "profiles_read_self_or_admin" on public.profiles;
create policy "profiles_read_self_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_user_role() = 'Administrator');

drop policy if exists "profiles_admin_manage" on public.profiles;
create policy "profiles_admin_manage" on public.profiles
  for update to authenticated
  using (public.current_user_role() = 'Administrator')
  with check (public.current_user_role() = 'Administrator');

-- Remove the starter schema's broad authenticated-user policies before adding
-- role-specific access. RLS policies are permissive, so leaving them in place
-- would override the restrictions below.
drop policy if exists "authenticated residents access" on public.residents;
drop policy if exists "authenticated households access" on public.households;
drop policy if exists "authenticated household members access" on public.household_members;
drop policy if exists "authenticated businesses access" on public.businesses;
drop policy if exists "authenticated certificates access" on public.certificates;
drop policy if exists "authenticated complaints access" on public.complaints;

drop policy if exists "resident staff access" on public.residents;
drop policy if exists "household staff access" on public.households;
drop policy if exists "household member staff access" on public.household_members;
drop policy if exists "business staff access" on public.businesses;
drop policy if exists "certificate staff access" on public.certificates;
drop policy if exists "complaint staff access" on public.complaints;

create policy "resident staff access" on public.residents
  for all to authenticated
  using (public.current_user_role() in ('Administrator', 'Barangay Secretary'))
  with check (public.current_user_role() in ('Administrator', 'Barangay Secretary'));

create policy "household staff access" on public.households
  for all to authenticated
  using (public.current_user_role() in ('Administrator', 'Barangay Secretary'))
  with check (public.current_user_role() in ('Administrator', 'Barangay Secretary'));

create policy "household member staff access" on public.household_members
  for all to authenticated
  using (public.current_user_role() in ('Administrator', 'Barangay Secretary'))
  with check (public.current_user_role() in ('Administrator', 'Barangay Secretary'));

create policy "business staff access" on public.businesses
  for all to authenticated
  using (public.current_user_role() in ('Administrator', 'Treasurer/Business Personnel'))
  with check (public.current_user_role() in ('Administrator', 'Treasurer/Business Personnel'));

create policy "certificate staff access" on public.certificates
  for all to authenticated
  using (public.current_user_role() in ('Administrator', 'Barangay Secretary'))
  with check (public.current_user_role() in ('Administrator', 'Barangay Secretary'));

create policy "complaint staff access" on public.complaints
  for all to authenticated
  using (public.current_user_role() in ('Administrator', 'Barangay Officer'))
  with check (public.current_user_role() in ('Administrator', 'Barangay Officer'));

-- Validate linked resident references in Postgres as well as in the UI.
create or replace function public.validate_active_resident_reference()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_resident_id uuid;
  linked_status text;
begin
  if tg_table_name = 'businesses' then
    linked_resident_id := new.owner_id;
  elsif tg_table_name = 'certificates' then
    linked_resident_id := new.resident_id;
  elsif tg_table_name = 'complaints' then
    linked_resident_id := new.complainant_id;
  end if;
  if linked_resident_id is null then
    raise exception 'A resident must be selected for this record';
  end if;
  select status into linked_status from public.residents where id = linked_resident_id;
  if not found or linked_status = 'Inactive' then
    raise exception 'The selected resident is inactive or unavailable';
  end if;
  return new;
end;
$$;

drop trigger if exists business_owner_must_be_active on public.businesses;
create trigger business_owner_must_be_active
  before insert or update of owner_id on public.businesses
  for each row execute procedure public.validate_active_resident_reference();

drop trigger if exists certificate_resident_must_be_active on public.certificates;
create trigger certificate_resident_must_be_active
  before insert or update of resident_id on public.certificates
  for each row execute procedure public.validate_active_resident_reference();

drop trigger if exists complaint_complainant_must_be_active on public.complaints;
create trigger complaint_complainant_must_be_active
  before insert or update of complainant_id on public.complaints
  for each row execute procedure public.validate_active_resident_reference();

-- Bootstrap the first administrator after this script runs:
-- update public.profiles set role = 'Administrator' where email = 'admin@your-barangay.gov.ph';

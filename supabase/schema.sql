-- Barangay Management System
-- Run this in Supabase SQL Editor.
create extension if not exists "pgcrypto";

create table if not exists residents (
 id uuid primary key default gen_random_uuid(),
 resident_number text unique not null,
 first_name text not null,
 middle_name text,
 last_name text not null,
 suffix text,
 sex text,
 birth_date date,
 civil_status text,
 nationality text default 'Filipino',
 contact_number text,
 email text,
 occupation text,
 education text,
 address text,
 voter_status text,
 status text default 'Active',
 date_registered date default current_date,
 created_at timestamptz default now()
);

create table if not exists households (
 id uuid primary key default gen_random_uuid(),
 household_number text unique not null,
 house_number text,
 address text not null,
 purok text,
 household_head text,
 housing_type text,
 ownership_status text,
 water_source text,
 electricity text,
 sanitation text,
 created_at timestamptz default now()
);

create table if not exists household_members (
 id uuid primary key default gen_random_uuid(),
 household_id uuid references households(id) on delete cascade,
 resident_id uuid references residents(id) on delete cascade,
 relationship text,
 created_at timestamptz default now(),
 unique(household_id,resident_id)
);

create table if not exists businesses (
 id uuid primary key default gen_random_uuid(),
 business_name text not null,
 owner_id uuid references residents(id),
 owner text,
 business_type text,
 address text,
 contact_number text,
 registration_date date,
 permit_number text unique,
 permit_expiry date,
 status text default 'Active',
 created_at timestamptz default now()
);

create table if not exists certificates (
 id uuid primary key default gen_random_uuid(),
 certificate_number text unique not null,
 resident_id uuid references residents(id),
 resident text,
 certificate_type text not null,
 purpose text,
 date_requested date default current_date,
 date_issued date,
 issued_by text,
 status text default 'Requested',
 created_at timestamptz default now()
);

create table if not exists complaints (
 id uuid primary key default gen_random_uuid(),
 complaint_number text unique not null,
 complainant_id uuid references residents(id),
 complainant text,
 respondent text,
 complaint_type text,
 description text,
 date_filed date default current_date,
 location text,
 assigned_to text,
 status text default 'Pending',
 resolution text,
 date_resolved date,
 created_at timestamptz default now()
);

-- For the classroom/demo frontend, enable access to authenticated users.
alter table residents enable row level security;
alter table households enable row level security;
alter table household_members enable row level security;
alter table businesses enable row level security;
alter table certificates enable row level security;
alter table complaints enable row level security;

create policy "authenticated residents access" on residents for all to authenticated using (true) with check (true);
create policy "authenticated households access" on households for all to authenticated using (true) with check (true);
create policy "authenticated household members access" on household_members for all to authenticated using (true) with check (true);
create policy "authenticated businesses access" on businesses for all to authenticated using (true) with check (true);
create policy "authenticated certificates access" on certificates for all to authenticated using (true) with check (true);
create policy "authenticated complaints access" on complaints for all to authenticated using (true) with check (true);

-- Create users through Supabase Authentication.
-- The application can later add a profiles/users table for role management.

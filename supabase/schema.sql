-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgjwt";
create extension if not exists "pg_crypto";

-- Users table (managed by Supabase Auth)
create table if not exists public.user_profiles (
  id uuid references auth.users primary key,
  first_name text,
  last_name text,
  date_of_birth date,
  synagogue text,
  community text,
  wallet_address text,
  verification_level text default 'none'::text,
  role text default 'user'::text,
  status text default 'pending'::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- KYC Documents
create table if not exists public.kyc_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id),
  type text not null,
  ipfs_cid text not null,
  encryption_tag text not null,
  status text default 'pending'::text,
  verified_at timestamptz,
  verified_by uuid references public.user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Token Balances
create table if not exists public.token_balances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id),
  currency text not null,
  balance text default '0',
  trust_line_status text default 'none'::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, currency)
);

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  from_user_id uuid references public.user_profiles(id),
  to_user_id uuid references public.user_profiles(id),
  amount text not null,
  currency text not null,
  type text not null,
  status text default 'pending'::text,
  xrpl_tx_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MitzvahPoints Rules
create table if not exists public.mitzvah_points_rules (
  id uuid primary key default uuid_generate_v4(),
  action_type text not null,
  base_points integer not null,
  multiplier float default 1.0,
  max_points integer,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security Policies

-- User Profiles
alter table public.user_profiles enable row level security;

create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- KYC Documents
alter table public.kyc_documents enable row level security;

create policy "Users can view their own documents"
  on public.kyc_documents for select
  using (auth.uid() = user_id);

create policy "Users can upload their own documents"
  on public.kyc_documents for insert
  with check (auth.uid() = user_id);

create policy "Only verifiers can update document status"
  on public.kyc_documents for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

-- Token Balances
alter table public.token_balances enable row level security;

create policy "Users can view their own balances"
  on public.token_balances for select
  using (auth.uid() = user_id);

-- Transactions
alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can create transactions"
  on public.transactions for insert
  with check (auth.uid() = from_user_id);

-- MitzvahPoints Rules
alter table public.mitzvah_points_rules enable row level security;

create policy "Anyone can view mitzvah points rules"
  on public.mitzvah_points_rules for select
  using (true);

create policy "Only admins can modify rules"
  on public.mitzvah_points_rules for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

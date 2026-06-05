-- ============================================
-- AUREA WEALTH: SUPABASE PRODUCTION SCHEMA
-- ============================================

create extension if not exists "pgcrypto";

-- 1) USERS
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null unique,
  wallet_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 2) INVESTMENT PLANS
create table if not exists public.investment_plans (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null unique,
  min_deposit numeric(14,2) not null,
  max_deposit numeric(14,2),
  roi numeric(5,2) not null,
  duration int not null,
  features text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 3) USER INVESTMENTS
create table if not exists public.user_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references public.investment_plans(id),
  amount numeric(14,2) not null,
  expected_profit numeric(14,2) not null,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  created_at timestamptz not null default now()
);

-- 4) TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(14,2) not null,
  transaction_type text not null check (transaction_type in ('deposit','withdrawal','investment','profit')),
  status text not null default 'pending' check (status in ('pending','completed','failed')),
  created_at timestamptz not null default now()
);

-- 5) WITHDRAWALS
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(14,2) not null,
  wallet_address text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- 6) NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_user_investments_user_id on public.user_investments(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_withdrawals_user_id on public.withdrawals(user_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- Create user profile row on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name','Investor'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Seed plans
insert into public.investment_plans (plan_name, min_deposit, max_deposit, roi, duration, features)
values
('Starter Plan', 1000, 2999, 10, 7, array['Basic investment analytics','Email support','Daily profit updates','Secure wallet protection']),
('Silver Plan', 3000, 5999, 18, 14, array['Advanced analytics','Faster withdrawals','Priority support','Portfolio management']),
('Gold Plan', 6000, 9999, 25, 21, array['VIP investment insights','AI-powered analytics','Personal account manager','Premium support']),
('Platinum Plan', 10000, 14999, 35, 30, array['Advanced AI trading tools','Instant withdrawals','VIP portfolio access','Private investment consultation']),
('Elite Investor Plan', 15000, null, 45, 45, array['Exclusive investment opportunities','Dedicated wealth advisor','Private investment dashboard','Global asset diversification','Premium investor privileges'])
on conflict (plan_name) do update set
  min_deposit = excluded.min_deposit,
  max_deposit = excluded.max_deposit,
  roi = excluded.roi,
  duration = excluded.duration,
  features = excluded.features;

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.users enable row level security;
alter table public.investment_plans enable row level security;
alter table public.user_investments enable row level security;
alter table public.transactions enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;

-- Helpers for admin role via auth metadata
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role') = 'admin', false);
$$;

-- users policies
drop policy if exists "users select own" on public.users;
create policy "users select own" on public.users for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "users update own" on public.users;
create policy "users update own" on public.users for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "users insert self" on public.users;
create policy "users insert self" on public.users for insert
with check (auth.uid() = id or public.is_admin());

-- plans are readable by all authenticated users
drop policy if exists "plans read" on public.investment_plans;
create policy "plans read" on public.investment_plans for select
using (auth.role() = 'authenticated');

drop policy if exists "plans admin write" on public.investment_plans;
create policy "plans admin write" on public.investment_plans for all
using (public.is_admin())
with check (public.is_admin());

-- user_investments
drop policy if exists "investments own read" on public.user_investments;
create policy "investments own read" on public.user_investments for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "investments own insert" on public.user_investments;
create policy "investments own insert" on public.user_investments for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "investments admin update" on public.user_investments;
create policy "investments admin update" on public.user_investments for update
using (public.is_admin())
with check (public.is_admin());

-- transactions
drop policy if exists "transactions own read" on public.transactions;
create policy "transactions own read" on public.transactions for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "transactions own insert" on public.transactions;
create policy "transactions own insert" on public.transactions for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "transactions admin update" on public.transactions;
create policy "transactions admin update" on public.transactions for update
using (public.is_admin())
with check (public.is_admin());

-- withdrawals
drop policy if exists "withdrawals own read" on public.withdrawals;
create policy "withdrawals own read" on public.withdrawals for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "withdrawals own insert" on public.withdrawals;
create policy "withdrawals own insert" on public.withdrawals for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "withdrawals admin update" on public.withdrawals;
create policy "withdrawals admin update" on public.withdrawals for update
using (public.is_admin())
with check (public.is_admin());

-- notifications
drop policy if exists "notifications own read" on public.notifications;
create policy "notifications own read" on public.notifications for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications own insert" on public.notifications;
create policy "notifications own insert" on public.notifications for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "notifications own update" on public.notifications;
create policy "notifications own update" on public.notifications for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

-- Admin expansion: run supabase/migrations/002_admin_expansion.sql
-- Adds: admin_users, profits, KYC fields, RPCs for wallet operations

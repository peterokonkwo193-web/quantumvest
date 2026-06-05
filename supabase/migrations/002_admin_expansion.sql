-- ============================================
-- AUREA WEALTH: ADMIN EXPANSION MIGRATION
-- Run in Supabase SQL Editor after schema.sql
-- ============================================

-- 1) Extend users table
alter table public.users
  add column if not exists kyc_status text not null default 'pending'
    check (kyc_status in ('pending','approved','rejected')),
  add column if not exists kyc_reviewed_at timestamptz,
  add column if not exists kyc_notes text,
  add column if not exists is_suspended boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.users(id);

-- 2) Extend transactions
alter table public.transactions
  add column if not exists reference_id uuid,
  add column if not exists notes text;

-- 3) Admin users registry (no passwords)
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  permissions jsonb not null default '{"all": true}'::jsonb,
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);

-- 4) Profits table
create table if not exists public.profits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid references public.investment_plans(id),
  investment_id uuid references public.user_investments(id),
  profit_type text not null default 'manual'
    check (profit_type in ('roi','manual','bonus','referral')),
  amount numeric(14,2) not null,
  profit_percentage numeric(5,2),
  description text,
  payout_date date,
  status text not null default 'pending'
    check (status in ('pending','scheduled','approved','paid','cancelled')),
  issued_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_profits_user_id on public.profits(user_id);
create index if not exists idx_profits_status on public.profits(status);
create index if not exists idx_profits_payout_date on public.profits(payout_date);

-- Sync existing admin
insert into public.admin_users (id, email, full_name)
select id, email, coalesce(raw_user_meta_data->>'full_name', 'Admin')
from auth.users
where coalesce(raw_app_meta_data->>'role', '') = 'admin'
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

create or replace function public.calculate_roi_profit(
  p_amount numeric,
  p_roi_percent numeric
)
returns numeric
language sql
immutable
as $$
  select round(p_amount * p_roi_percent / 100, 2);
$$;

-- ============================================
-- ATOMIC RPCs (security definer)
-- ============================================

create or replace function public.approve_deposit(
  p_transaction_id uuid,
  p_admin_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx record;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select * into v_tx from public.transactions
  where id = p_transaction_id and transaction_type = 'deposit' and status = 'pending'
  for update;

  if not found then
    raise exception 'Deposit transaction not found or already processed';
  end if;

  update public.transactions
  set status = 'completed', notes = coalesce(notes, 'Approved by admin')
  where id = p_transaction_id;

  update public.users
  set wallet_balance = wallet_balance + v_tx.amount
  where id = v_tx.user_id;

  insert into public.notifications (user_id, title, message)
  values (v_tx.user_id, 'Deposit Approved', 'Your deposit of $' || v_tx.amount || ' has been credited.');
end;
$$;

create or replace function public.approve_withdrawal(
  p_withdrawal_id uuid,
  p_admin_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_w record;
  v_balance numeric;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select * into v_w from public.withdrawals
  where id = p_withdrawal_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Withdrawal not found or already processed';
  end if;

  select wallet_balance into v_balance from public.users where id = v_w.user_id for update;

  if v_balance < v_w.amount then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.withdrawals set status = 'approved' where id = p_withdrawal_id;

  update public.transactions
  set status = 'completed'
  where user_id = v_w.user_id
    and transaction_type = 'withdrawal'
    and status = 'pending'
    and amount = v_w.amount
    and created_at >= v_w.created_at - interval '1 minute'
    and created_at <= v_w.created_at + interval '1 minute';

  update public.users
  set wallet_balance = wallet_balance - v_w.amount
  where id = v_w.user_id;

  insert into public.notifications (user_id, title, message)
  values (v_w.user_id, 'Withdrawal Approved', 'Your withdrawal of $' || v_w.amount || ' has been processed.');
end;
$$;

create or replace function public.reject_withdrawal(
  p_withdrawal_id uuid,
  p_admin_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_w record;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select * into v_w from public.withdrawals
  where id = p_withdrawal_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Withdrawal not found or already processed';
  end if;

  update public.withdrawals set status = 'rejected' where id = p_withdrawal_id;

  update public.transactions
  set status = 'failed'
  where user_id = v_w.user_id
    and transaction_type = 'withdrawal'
    and status = 'pending'
    and amount = v_w.amount
    and created_at >= v_w.created_at - interval '1 minute'
    and created_at <= v_w.created_at + interval '1 minute';

  insert into public.notifications (user_id, title, message)
  values (v_w.user_id, 'Withdrawal Rejected', 'Your withdrawal request was not approved.');
end;
$$;

create or replace function public.distribute_profit(
  p_profit_id uuid,
  p_admin_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profit record;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select * into v_profit from public.profits
  where id = p_profit_id and status in ('pending','scheduled','approved')
  for update;

  if not found then
    raise exception 'Profit record not found or already paid';
  end if;

  update public.profits
  set status = 'paid', issued_by = p_admin_id
  where id = p_profit_id;

  update public.users
  set wallet_balance = wallet_balance + v_profit.amount
  where id = v_profit.user_id;

  insert into public.transactions (user_id, amount, transaction_type, status, reference_id, notes)
  values (v_profit.user_id, v_profit.amount, 'profit', 'completed', p_profit_id, v_profit.description);

  insert into public.notifications (user_id, title, message)
  values (
    v_profit.user_id,
    'Profit Credited',
    'A profit of $' || v_profit.amount || ' has been added to your wallet.'
  );
end;
$$;

create or replace function public.suspend_user(
  p_target_user_id uuid,
  p_suspend boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  update public.users
  set is_suspended = p_suspend
  where id = p_target_user_id and deleted_at is null;

  if not found then
    raise exception 'User not found';
  end if;
end;
$$;

create or replace function public.soft_delete_user(
  p_target_user_id uuid,
  p_admin_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  update public.users
  set deleted_at = now(), is_suspended = true
  where id = p_target_user_id and deleted_at is null;

  if not found then
    raise exception 'User not found or already deleted';
  end if;
end;
$$;

create or replace function public.update_kyc_status(
  p_user_id uuid,
  p_status text,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  if p_status not in ('pending','approved','rejected') then
    raise exception 'Invalid KYC status';
  end if;

  update public.users
  set kyc_status = p_status,
      kyc_reviewed_at = now(),
      kyc_notes = p_notes
  where id = p_user_id;

  insert into public.notifications (user_id, title, message)
  values (
    p_user_id,
    'KYC Update',
    'Your KYC verification status is now: ' || p_status
  );
end;
$$;

-- ============================================
-- RLS FOR NEW TABLES
-- ============================================
alter table public.admin_users enable row level security;
alter table public.profits enable row level security;

drop policy if exists "admin_users admin read" on public.admin_users;
create policy "admin_users admin read" on public.admin_users for select
using (public.is_admin());

drop policy if exists "profits admin all" on public.profits;
create policy "profits admin all" on public.profits for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profits own read paid" on public.profits;
create policy "profits own read paid" on public.profits for select
using (auth.uid() = user_id and status = 'paid');

-- Users: hide soft-deleted from non-admins
drop policy if exists "users select own" on public.users;
create policy "users select own" on public.users for select
using (
  (auth.uid() = id and deleted_at is null)
  or public.is_admin()
);

-- Prevent users from updating sensitive fields directly
drop policy if exists "users update own" on public.users;
create policy "users update own" on public.users for update
using (auth.uid() = id and deleted_at is null)
with check (
  auth.uid() = id
  and deleted_at is null
);

drop policy if exists "users admin update" on public.users;
create policy "users admin update" on public.users for update
using (public.is_admin())
with check (public.is_admin());

# Supabase Architecture — Aurea Wealth

## Stack
- Next.js App Router (frontend + secure API routes)
- Supabase Auth (email/password + reset flow)
- Supabase Postgres + RLS
- Supabase Realtime subscriptions in dashboard/admin

## Core Flow
1. User signs up via Supabase Auth.
2. Trigger creates profile in `public.users`.
3. Middleware validates session for `/dashboard` and `/admin`.
4. Dashboard reads/writes own rows only (RLS).
5. Admin actions require `app_metadata.role = admin`.
6. Wallet mutations use security-definer RPCs (`approve_deposit`, `approve_withdrawal`, `distribute_profit`).

## Admin Tables
- `admin_users` — admin registry (no passwords; auth via Supabase)
- `profits` — profit allocation, bonuses, referral commissions, scheduled payouts

## Security Model
- RLS enabled on all business tables.
- Policy-level ownership enforcement via `auth.uid() = user_id`.
- Admin privileges through `public.is_admin()` + JWT app metadata.
- Passwords exist only in `auth.users` (hashed by Supabase); never exposed in admin UI.
- `SUPABASE_SERVICE_ROLE_KEY` used server-side only for auth ban on suspend/soft-delete.
- Secure server route handlers for all financial operations:
  - `POST /api/transactions/deposit`
  - `POST /api/transactions/withdraw`
  - `POST /api/investments/activate`
  - `POST /api/admin/approvals` (RPC-backed wallet updates)
  - Full admin API under `/api/admin/*`

## Realtime Model
- Dashboard subscribes to:
  - `transactions`
  - `notifications`
- Admin panel subscribes to:
  - `withdrawals`
  - `transactions`

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- Optional: `NEXT_PUBLIC_SITE_URL`

## Production Checklist
- Add MFA to auth settings.
- Set custom SMTP for auth emails.
- Configure admin accounts with `app_metadata.role = admin`.
- Add rate limits on auth and payment-related APIs.
- Connect KYC document storage to Supabase Storage (private bucket).
- Add audit-log table and immutable event trail for compliance.

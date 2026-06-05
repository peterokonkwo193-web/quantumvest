# Aurea Wealth — Supabase Integrated

A futuristic crypto investment platform with production-grade Supabase architecture.

## Stack
- Next.js App Router + TypeScript + Tailwind + Framer Motion
- Supabase Auth + Postgres + Realtime + RLS

## Environment
Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only (never expose to the browser). Used for admin suspend/delete auth operations.

## Database Setup
1. Open Supabase SQL editor.
2. Run `supabase/schema.sql`.
3. Run `supabase/migrations/002_admin_expansion.sql`.

This creates:
- `users` (with KYC, suspend, soft-delete fields)
- `admin_users`, `profits`
- `investment_plans`, `user_investments`, `transactions`, `withdrawals`, `notifications`
- Atomic RPCs for deposits, withdrawals, profits
- seed plans + RLS policies + signup trigger

## Auth Features
- Signup
- Login
- Logout
- Forgot password
- Session middleware for protected routes
- Admin role checks via JWT app metadata

## Admin Console (`/admin`)
- Overview, Users, Profit Management, Plans, Transactions, Analytics
- Role required: `app_metadata.role = admin` on auth user
- Passwords are never stored or displayed in admin UI (Supabase Auth only)

## API Routes
- `POST /api/transactions/deposit`
- `POST /api/transactions/withdraw`
- `POST /api/investments/activate`
- `POST /api/admin/approvals`
- `GET/POST /api/admin/users`, `GET /api/admin/users/[id]`
- `POST /api/admin/users/[id]/suspend|delete|kyc`
- `GET/POST /api/admin/profits`, `POST /api/admin/profits/process-due`
- `GET/POST /api/admin/plans`, `PATCH/DELETE /api/admin/plans/[id]`
- `GET /api/admin/analytics`

## Run
```bash
npm install
npm run dev
```

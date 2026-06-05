import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { supabase } = auth;

  const [
    usersRes,
    investmentsRes,
    transactionsRes,
    withdrawalsRes,
    profitsRes,
    plansRes,
    pendingTxRes,
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("user_investments")
      .select("user_id")
      .eq("status", "active"),
    supabase.from("transactions").select("amount, transaction_type, status, created_at"),
    supabase.from("withdrawals").select("amount, status, created_at"),
    supabase.from("profits").select("amount, status, created_at"),
    supabase.from("investment_plans").select("id", { count: "exact", head: true }),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const transactions = transactionsRes.data ?? [];
  const withdrawals = withdrawalsRes.data ?? [];
  const profits = profitsRes.data ?? [];
  const activeInvestments = investmentsRes.data ?? [];

  const totalDeposits = transactions
    .filter((t) => t.transaction_type === "deposit" && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalWithdrawals = withdrawals
    .filter((w) => w.status === "approved")
    .reduce((s, w) => s + Number(w.amount), 0);

  const revenue = transactions
    .filter((t) => t.transaction_type === "investment" && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);

  const profitsIssued = profits
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0);

  const activeInvestorIds = new Set(activeInvestments.map((i) => i.user_id));

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const depositsByDay = last30Days.map((day) => ({
    date: day,
    deposits: transactions
      .filter(
        (t) =>
          t.transaction_type === "deposit" &&
          t.status === "completed" &&
          t.created_at.startsWith(day)
      )
      .reduce((s, t) => s + Number(t.amount), 0),
    withdrawals: withdrawals
      .filter((w) => w.status === "approved" && w.created_at.startsWith(day))
      .reduce((s, w) => s + Number(w.amount), 0),
    revenue: transactions
      .filter(
        (t) =>
          t.transaction_type === "investment" &&
          t.status === "completed" &&
          t.created_at.startsWith(day)
      )
      .reduce((s, t) => s + Number(t.amount), 0),
    profits: profits
      .filter((p) => p.status === "paid" && p.created_at.startsWith(day))
      .reduce((s, p) => s + Number(p.amount), 0),
  }));

  const { data: recentUsers } = await supabase
    .from("users")
    .select("id, full_name, email, created_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentActivity = [
    ...transactions.slice(0, 10).map((t) => ({
      type: "transaction" as const,
      id: t.created_at + t.amount,
      label: `${t.transaction_type} — $${t.amount}`,
      status: t.status,
      created_at: t.created_at,
    })),
    ...withdrawals.slice(0, 5).map((w) => ({
      type: "withdrawal" as const,
      id: w.created_at + w.amount,
      label: `Withdrawal — $${w.amount}`,
      status: w.status,
      created_at: w.created_at,
    })),
    ...(recentUsers ?? []).map((u) => ({
      type: "signup" as const,
      id: u.id,
      label: `New user: ${u.full_name ?? u.email}`,
      status: "completed",
      created_at: u.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15);

  return NextResponse.json({
    stats: {
      totalUsers: usersRes.count ?? 0,
      activeInvestors: activeInvestorIds.size,
      totalDeposits,
      totalWithdrawals,
      revenue,
      profitsIssued,
      activePlans: plansRes.count ?? 0,
      pendingTransactions: pendingTxRes.count ?? 0,
    },
    chartData: depositsByDay,
    recentActivity,
  });
}

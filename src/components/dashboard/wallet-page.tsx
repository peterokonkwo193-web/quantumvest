"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { investmentPlans } from "@/lib/data/investment-plans";
import { createClient } from "@/lib/supabase";
import { DepositFlow } from "@/components/dashboard/deposit-modal";

type Transaction = {
  id: string;
  amount: number;
  transaction_type: "deposit" | "withdrawal" | "investment" | "profit";
  status: "pending" | "completed" | "failed";
  notes: string | null;
  created_at: string;
};
type UserInvestment = {
  id: string;
  plan_id: string;
  amount: number;
  expected_profit: number;
  status: string;
  start_date: string;
  end_date: string;
};
type AdminProfit = {
  id: string;
  amount: number;
  description: string | null;
  profit_type: string;
  status: string;
  created_at: string;
};
type UserProfile = {
  wallet_balance: number;
  full_name: string | null;
  email: string;
};

export function WalletPage() {
  const supabase = createClient();
  const isMounted = useRef(true);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [profits, setProfits] = useState<AdminProfit[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "deposit" | "withdraw">("overview");


  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isMounted.current) return;

    const [profileRes, txRes, invRes, profitRes] = await Promise.all([
      supabase.from("users").select("wallet_balance, full_name, email").eq("id", user.id).single(),
      supabase.from("transactions").select("id, amount, transaction_type, status, notes, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("user_investments").select("id, plan_id, amount, expected_profit, status, start_date, end_date")
        .eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }),
      supabase.from("profits").select("id, amount, description, profit_type, status, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);

    if (!isMounted.current) return;
    setProfile(profileRes.data ?? null);
    const allTx = (txRes.data as unknown as Transaction[]) ?? [];
    setTransactions(allTx.filter((t) => !(t.transaction_type === "deposit" && t.status === "pending")));
    setPendingDeposits(allTx.filter((t) => t.transaction_type === "deposit" && t.status === "pending"));
    setInvestments((invRes.data as unknown as UserInvestment[]) ?? []);
    setProfits((profitRes.data as unknown as AdminProfit[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    isMounted.current = true;
    load();
    const supabase2 = createClient();
    const ch = supabase2.channel("wallet-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "profits" }, load)
      .subscribe();
    return () => { isMounted.current = false; supabase2.removeChannel(ch); };
  }, [load]);

  const totalExpectedProfit = useMemo(() => investments.reduce((s, i) => s + i.expected_profit, 0), [investments]);
  const totalProfitsReceived = useMemo(() => profits.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0), [profits]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "deposit", label: "Deposit" },
    { id: "withdraw", label: "Withdraw" },
  ] as const;

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1000px]">
        {/* Header */}
        <FadeIn className="mb-8">
          <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-neon">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/30 bg-neon/10">
              <Wallet className="h-6 w-6 text-neon" />
            </div>
            <div>
              <span className="label-mono text-neon">My Wallet</span>
              <h1 className="text-3xl font-bold text-white">{formatCurrency(profile?.wallet_balance ?? 0)}</h1>
              <p className="text-sm text-on-surface-variant">Available balance · updates in real time</p>
            </div>
          </div>
        </FadeIn>

        {/* Summary cards */}
        <FadeIn className="mb-8 grid gap-4 sm:grid-cols-3">
          <GlassCard className="text-center">
            <TrendingUp className="mx-auto mb-2 h-5 w-5 text-neon" />
            <p className="text-2xl font-bold text-neon">{formatCurrency(totalExpectedProfit)}</p>
            <p className="label-mono mt-1 text-xs text-on-surface-variant">Expected from Active Plans</p>
          </GlassCard>
          <GlassCard className="text-center">
            <CheckCircle className="mx-auto mb-2 h-5 w-5 text-neon" />
            <p className="text-2xl font-bold text-neon">{formatCurrency(totalProfitsReceived)}</p>
            <p className="label-mono mt-1 text-xs text-on-surface-variant">Total Profits Received</p>
          </GlassCard>
          <GlassCard className="text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-yellow-400" />
            <p className="text-2xl font-bold text-yellow-400">{pendingDeposits.length}</p>
            <p className="label-mono mt-1 text-xs text-on-surface-variant">Pending Deposit{pendingDeposits.length !== 1 ? "s" : ""}</p>
          </GlassCard>
        </FadeIn>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                activeTab === t.id
                  ? "bg-neon text-black shadow"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Pending deposits */}
            {pendingDeposits.length > 0 && (
              <GlassCard className="border-yellow-400/30">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                  <Clock className="h-4 w-4 text-yellow-400" /> Pending Deposits
                </h3>
                <div className="space-y-3">
                  {pendingDeposits.map((dep) => {
                    let planName: string | null = null;
                    try { planName = JSON.parse(dep.notes ?? "{}").planName ?? null; } catch {}
                    return (
                      <div key={dep.id} className="flex items-center justify-between rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
                        <div>
                          <p className="font-bold text-white">Deposit awaiting admin approval</p>
                          {planName && <p className="text-xs text-yellow-300">Investment Plan: {planName}</p>}
                          <p className="text-xs text-on-surface-variant mt-0.5">{new Date(dep.created_at).toLocaleString()}</p>
                        </div>
                        <p className="font-extrabold text-yellow-400">{formatCurrency(dep.amount)}</p>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}

            {/* Active Investment Plans */}
            <GlassCard>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <TrendingUp className="h-4 w-4 text-neon" /> My Current Investment Plans
              </h3>
              {investments.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-on-surface-variant">No active investments yet.</p>
                  <Link href="/plans" className="mt-2 inline-block text-xs text-neon hover:underline">Browse investment plans →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {investments.map((inv) => {
                    const plan = investmentPlans.find((p) => p.id === inv.plan_id);
                    const start = new Date(inv.start_date);
                    const end = new Date(inv.end_date);
                    const now = new Date();
                    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
                    const elapsed = Math.min(totalDays, Math.round((now.getTime() - start.getTime()) / 86400000));
                    const progress = Math.round((elapsed / totalDays) * 100);
                    return (
                      <div key={inv.id} className="rounded-xl border border-neon/20 bg-neon/5 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white">{plan?.name ?? inv.plan_id} Plan</span>
                            <span className="ml-2 rounded-full bg-neon/20 px-2 py-0.5 text-[10px] font-bold text-neon">{plan?.roi ?? 0}% ROI</span>
                          </div>
                          <span className="text-xs text-on-surface-variant">{plan?.duration}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center text-xs mb-3">
                          <div className="rounded-lg bg-white/5 p-2">
                            <p className="text-on-surface-variant">Invested</p>
                            <p className="font-bold text-white">{formatCurrency(inv.amount)}</p>
                          </div>
                          <div className="rounded-lg bg-white/5 p-2">
                            <p className="text-on-surface-variant">Expected Profit</p>
                            <p className="font-bold text-neon">{formatCurrency(inv.expected_profit)}</p>
                          </div>
                          <div className="rounded-lg bg-white/5 p-2">
                            <p className="text-on-surface-variant">Ends</p>
                            <p className="font-bold text-white">{end.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-on-surface-variant mb-1">
                            <span>Cycle Progress — Day {elapsed} of {totalDays}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-neon transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>

            {/* Profit History */}
            <GlassCard>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <CheckCircle className="h-4 w-4 text-neon" /> Profit History
              </h3>
              {profits.length === 0 ? (
                <p className="py-6 text-center text-sm text-on-surface-variant">No profits received yet.</p>
              ) : (
                <div className="space-y-3">
                  {profits.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-neon/20 bg-neon/5 p-4">
                      <div>
                        <p className="font-bold text-white">{p.description ?? "Profit Payout"}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {new Date(p.created_at).toLocaleString()} · {p.profit_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-neon">+{formatCurrency(p.amount)}</p>
                        <p className="text-[10px] text-neon/60">{p.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Transaction History */}
            <GlassCard>
              <h3 className="mb-4 font-bold text-white">Transaction History</h3>
              {transactions.length === 0 ? (
                <p className="py-6 text-center text-sm text-on-surface-variant">No transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => {
                    let planName: string | null = null;
                    try { planName = JSON.parse(tx.notes ?? "{}").planName ?? null; } catch {}
                    const label =
                      tx.transaction_type === "profit" ? "Profit Credited by Admin"
                      : tx.transaction_type === "deposit" ? `Deposit${planName ? ` — ${planName}` : ""}`
                      : tx.transaction_type === "withdrawal" ? "Withdrawal"
                      : "Investment Activated";
                    const isCredit = tx.transaction_type === "profit" || tx.transaction_type === "deposit";
                    return (
                      <div key={tx.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                            tx.transaction_type === "withdrawal"
                              ? "border-orange-400/20 bg-orange-400/5"
                              : "border-neon/20 bg-neon/5"
                          }`}>
                            {tx.transaction_type === "deposit" ? <ArrowDownLeft className="h-4 w-4 text-neon" />
                              : tx.transaction_type === "withdrawal" ? <ArrowUpRight className="h-4 w-4 text-orange-400" />
                              : <TrendingUp className="h-4 w-4 text-neon" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{label}</p>
                            <p className="text-xs text-on-surface-variant">{new Date(tx.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isCredit ? "text-neon" : "text-orange-400"}`}>
                            {isCredit ? "+" : "-"}{formatCurrency(tx.amount)}
                          </p>
                          <p className={`text-[10px] ${
                            tx.status === "completed" ? "text-neon/60"
                            : tx.status === "failed" ? "text-red-400"
                            : "text-yellow-400"
                          }`}>{tx.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ── DEPOSIT TAB ── */}
        {activeTab === "deposit" && (
          <GlassCard>
            <h3 className="mb-6 flex items-center gap-2 font-bold text-white">
              <ArrowDownLeft className="h-5 w-5 text-neon" /> Make a Deposit
            </h3>
            <DepositFlow onSuccess={() => { setActiveTab("overview"); load(); }} />
          </GlassCard>
        )}

        {/* ── WITHDRAW TAB ── */}
        {activeTab === "withdraw" && (
          <GlassCard className="text-center py-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-neon/30 bg-neon/10">
              <ArrowUpRight className="h-8 w-8 text-neon" />
            </div>
            <h3 className="text-xl font-bold text-white">Withdrawal Request</h3>
            <p className="mt-3 text-on-surface-variant max-w-sm mx-auto">
              To withdraw your funds, please contact the admin directly. Your request will be reviewed and processed within <span className="text-white font-bold">24–48 hours</span>.
            </p>
            <div className="mt-8 rounded-2xl border border-neon/20 bg-neon/5 p-6 max-w-sm mx-auto text-left space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-neon">Contact Admin</p>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <CheckCircle className="h-4 w-4 text-neon" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Current Balance</p>
                  <p className="text-xs text-on-surface-variant">{formatCurrency(profile?.wallet_balance ?? 0)} available</p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant pt-2 border-t border-white/10">
                Reach out via the <Link href="/contact" className="text-neon hover:underline font-bold">Contact page</Link> or through your account support channel to request a withdrawal. Include the amount and your wallet address.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="mt-6"
              asChild
            >
              <Link href="/contact">Contact Admin for Withdrawal</Link>
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

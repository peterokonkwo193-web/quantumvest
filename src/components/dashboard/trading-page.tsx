"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { PortfolioChart, ProfitChart } from "@/components/charts/portfolio-chart";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: "deposit" | "withdrawal" | "investment" | "profit";
  status: "pending" | "completed" | "failed";
  notes?: string;
  created_at: string;
};
type AdminProfit = {
  id: string;
  amount: number;
  description: string | null;
  profit_type: string;
  status: string;
  created_at: string;
};

const TABS = ["Overview", "Transactions", "Profits"] as const;
type Tab = (typeof TABS)[number];

export function TradingPage() {
  const supabase = createClient();
  const isMounted = useRef(true);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<Transaction[]>([]);
  const [adminProfits, setAdminProfits] = useState<AdminProfit[]>([]);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isMounted.current) return;

    const [txRes, profitRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("profits")
        .select("id, amount, description, profit_type, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (!isMounted.current) return;
    const allTx = (txRes.data as unknown as Transaction[]) ?? [];
    setTransactions(allTx.filter((t) => t.status !== "pending" || t.transaction_type !== "deposit"));
    setPendingDeposits(allTx.filter((t) => t.transaction_type === "deposit" && t.status === "pending"));
    setAdminProfits((profitRes.data as unknown as AdminProfit[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    isMounted.current = true;
    load();
    const channel = supabase
      .channel("trading-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "profits" }, load)
      .subscribe();
    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  const totalDeposited = transactions
    .filter((t) => t.transaction_type === "deposit" && t.status === "completed")
    .reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions
    .filter((t) => t.transaction_type === "withdrawal" && t.status === "completed")
    .reduce((s, t) => s + t.amount, 0);
  const totalProfits = adminProfits
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + p.amount, 0);

  if (loading) {
    return (
      <div className="section-padding flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-neon"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="mb-8">
            <span className="label-mono text-neon">Trading Activity</span>
            <h1 className="mt-1 text-3xl font-bold text-white">Trading History</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Your full transaction records, profit history, and portfolio analytics.
            </p>
          </div>

          {/* Summary cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <GlassCard>
              <p className="label-mono text-on-surface-variant">Total Deposited</p>
              <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(totalDeposited)}</p>
            </GlassCard>
            <GlassCard glow>
              <p className="label-mono text-neon">Total Profits</p>
              <p className="mt-1 text-2xl font-bold text-neon">{formatCurrency(totalProfits)}</p>
            </GlassCard>
            <GlassCard>
              <p className="label-mono text-on-surface-variant">Total Withdrawn</p>
              <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(totalWithdrawn)}</p>
            </GlassCard>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-neon text-black shadow-[0_0_16px_rgba(198,255,0,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <GlassCard>
                <h3 className="mb-4 font-bold text-white">Portfolio Growth</h3>
                <PortfolioChart height={300} />
              </GlassCard>
              <GlassCard>
                <h3 className="mb-4 font-bold text-white">Profit Analytics</h3>
                <ProfitChart height={200} />
              </GlassCard>
            </div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === "Transactions" && (
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-white">All Transactions</h3>
                <span className="rounded-full bg-neon/10 px-2 py-0.5 text-[10px] font-bold text-neon">Live</span>
              </div>

              {pendingDeposits.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">Pending Approval</p>
                  {pendingDeposits.map((dep) => {
                    let planName: string | null = null;
                    try { planName = JSON.parse(dep.notes ?? "{}").planName ?? null; } catch {}
                    return (
                      <div key={dep.id} className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">Deposit{planName ? ` — ${planName}` : ""}</p>
                            <p className="text-xs text-on-surface-variant">{new Date(dep.created_at).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-yellow-400">+{formatCurrency(dep.amount)}</p>
                            <p className="text-xs text-yellow-400/70">pending</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No transactions yet.</p>
                ) : (
                  transactions.map((tx) => {
                    let planName: string | null = null;
                    try { planName = JSON.parse(tx.notes ?? "{}").planName ?? null; } catch {}
                    const label =
                      tx.transaction_type === "profit" ? "Profit Credited by Admin"
                      : tx.transaction_type === "deposit" ? `Deposit${planName ? ` — ${planName}` : ""}`
                      : tx.transaction_type === "withdrawal" ? "Withdrawal"
                      : "Investment";
                    return (
                      <div key={tx.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                            tx.transaction_type === "profit" ? "border-neon/30 bg-neon/10"
                            : tx.transaction_type === "deposit" ? "border-neon/20 bg-neon/5"
                            : tx.transaction_type === "withdrawal" ? "border-orange-400/20 bg-orange-400/5"
                            : "border-white/10 bg-white/5"
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
                          <p className={`font-mono font-bold ${tx.transaction_type === "withdrawal" ? "text-orange-400" : "text-neon"}`}>
                            {tx.transaction_type === "withdrawal" ? "-" : "+"}{formatCurrency(tx.amount)}
                          </p>
                          <p className={`text-xs ${tx.status === "completed" ? "text-neon/70" : tx.status === "failed" ? "text-red-400" : "text-yellow-400"}`}>
                            {tx.status}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          )}

          {/* ── PROFITS TAB ── */}
          {activeTab === "Profits" && (
            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-neon" />
                <h3 className="font-bold text-white">Profit History from Admin</h3>
              </div>
              {adminProfits.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No profits credited yet.</p>
              ) : (
                <div className="space-y-3">
                  {adminProfits.map((p) => (
                    <div key={p.id} className="rounded-xl border border-neon/20 bg-neon/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">{p.description ?? "Profit Payout"}</p>
                          <p className="mt-0.5 text-xs text-on-surface-variant">
                            {new Date(p.created_at).toLocaleString()} · {p.profit_type}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-neon">+{formatCurrency(p.amount)}</p>
                          <p className="text-[10px] text-neon/70">{p.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}
        </FadeIn>
      </div>
    </div>
  );
}

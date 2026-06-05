"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle,
  DollarSign,
  Loader2,
  Mail,
  TrendingUp,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

type Analytics = {
  stats: {
    totalUsers: number;
    activeInvestors: number;
    totalDeposits: number;
    totalWithdrawals: number;
    revenue: number;
    profitsIssued: number;
    activePlans: number;
    pendingTransactions: number;
  };
  chartData: { date: string; deposits: number; withdrawals: number; revenue: number }[];
  recentActivity: { type: string; label: string; status: string; created_at: string }[];
};

type EnrichedDeposit = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  user_full_name: string | null;
  user_email: string | null;
  user_wallet_balance: number;
  user_kyc_status: string | null;
  crypto_type: string | null;
  network: string | null;
  tx_hash: string | null;
};

const CRYPTO_COLORS: Record<string, string> = {
  BTC: "text-[#F7931A] border-[#F7931A44] bg-[#F7931A11]",
  USDT: "text-[#26A17B] border-[#26A17B44] bg-[#26A17B11]",
  ETH: "text-[#627EEA] border-[#627EEA44] bg-[#627EEA11]",
};

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Analytics | null>(null);
  const [pendingDeposits, setPendingDeposits] = useState<EnrichedDeposit[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    const res = await fetch("/api/admin/analytics");
    if (res.ok) setData(await res.json());
  }, []);

  const loadPending = useCallback(async () => {
    const res = await fetch("/api/admin/pending-deposits");
    if (res.ok) {
      const d = await res.json();
      setPendingDeposits((d.deposits ?? []).slice(0, 5));
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadAnalytics(), loadPending()]);
    setLoading(false);
  }, [loadAnalytics, loadPending]);

  useEffect(() => {
    loadAll();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-overview-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, loadAnalytics)
      .on("postgres_changes", { event: "*", schema: "public", table: "profits" }, loadAnalytics)
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, loadAll)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll, loadAnalytics]);

  async function approveDeposit(id: string, action: "approve" | "reject") {
    setProcessing(id);
    await fetch("/api/admin/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: action === "approve" ? "deposit" : "transaction",
        id,
        action,
        status: action === "approve" ? "completed" : "rejected",
      }),
    });
    await loadAll();
    setProcessing(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  const s = data?.stats;
  const stats = [
    { label: "Total Users", value: String(s?.totalUsers ?? 0), icon: Users },
    { label: "Active Investors", value: String(s?.activeInvestors ?? 0), icon: TrendingUp },
    { label: "Total Deposits", value: formatCurrency(s?.totalDeposits ?? 0), icon: ArrowDownLeft },
    { label: "Total Withdrawals", value: formatCurrency(s?.totalWithdrawals ?? 0), icon: ArrowUpRight },
    { label: "Revenue Generated", value: formatCurrency(s?.revenue ?? 0), icon: DollarSign },
    { label: "Profits Issued", value: formatCurrency(s?.profitsIssued ?? 0), icon: Wallet },
    { label: "Active Plans", value: String(s?.activePlans ?? 0), icon: TrendingUp },
    {
      label: "Pending Transactions",
      value: String(s?.pendingTransactions ?? 0),
      icon: Bell,
      highlight: (s?.pendingTransactions ?? 0) > 0,
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px]">
      <FadeIn className="mb-8">
        <span className="label-mono text-neon">Command Center</span>
        <h1 className="text-3xl font-bold text-white">Platform Overview</h1>
        <p className="mt-2 text-on-surface-variant">Real-time platform operations and analytics</p>
      </FadeIn>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.04}>
            <GlassCard
              className={`transition-colors ${"highlight" in stat && stat.highlight ? "border-neon/40 shadow-[0_0_20px_rgba(198,255,0,0.15)]" : "hover:border-neon/30"}`}
            >
              <stat.icon className={`h-5 w-5 ${"highlight" in stat && stat.highlight ? "text-neon" : "text-neon"}`} />
              <p className="mt-3 text-2xl font-bold text-white">{stat.value}</p>
              <p className="label-mono mt-1 text-on-surface-variant">{stat.label}</p>
            </GlassCard>
          </FadeIn>
        ))}
      </div>

      {/* Pending deposits — always shown prominently */}
      {pendingDeposits.length > 0 && (
        <FadeIn className="mb-8">
          <GlassCard className="border-neon/20">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Bell className="h-4 w-4 text-neon animate-pulse" />
                  Awaiting Approval
                  <span className="rounded-full bg-neon/20 px-2 py-0.5 text-xs text-neon">
                    {pendingDeposits.length}
                  </span>
                </h3>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  Clients who have confirmed payment and are waiting for account credit
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/transactions">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {pendingDeposits.map((deposit) => {
                const isProcessing = processing === deposit.id;
                const displayName = deposit.user_full_name ?? deposit.user_email ?? deposit.user_id.slice(0, 12);
                const initials = (deposit.user_full_name ?? deposit.user_email ?? "??")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const cryptoColor = CRYPTO_COLORS[deposit.crypto_type ?? ""] ?? "text-white border-white/20 bg-white/5";

                return (
                  <div
                    key={deposit.id}
                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-start"
                  >
                    {/* Client identity */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neon/30 bg-neon/10 text-sm font-bold text-neon">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-white">{displayName}</span>
                          {deposit.crypto_type && (
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${cryptoColor}`}>
                              {deposit.crypto_type}{deposit.network ? ` · ${deposit.network}` : ""}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                          {deposit.user_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />{deposit.user_email}
                            </span>
                          )}
                          {deposit.user_full_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />{deposit.user_full_name}
                            </span>
                          )}
                        </div>
                        {deposit.tx_hash && (
                          <div className="mt-2 rounded-lg border border-white/5 bg-white/5 px-2 py-1.5">
                            <p className="text-[9px] text-on-surface-variant mb-0.5">TX Hash</p>
                            <p className="break-all font-mono text-[10px] text-neon">{deposit.tx_hash}</p>
                          </div>
                        )}
                        <p className="mt-1.5 text-[10px] text-on-surface-variant/50">
                          Submitted {new Date(deposit.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Amount + actions */}
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-xl font-extrabold text-neon">{formatCurrency(deposit.amount)}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveDeposit(deposit.id, "approve")}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => approveDeposit(deposit.id, "reject")}
                          disabled={isProcessing}
                          className="gap-1 text-red-400 hover:text-red-300"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </FadeIn>
      )}

      {/* Chart + activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h3 className="mb-4 font-bold text-white">Revenue &amp; Deposits</h3>
          <AdminRevenueChart data={data?.chartData ?? []} />
        </GlassCard>
        <GlassCard>
          <h3 className="mb-4 font-bold text-white">Recent Activity</h3>
          <div className="max-h-[320px] space-y-2 overflow-auto custom-scrollbar">
            {(data?.recentActivity ?? []).map((item, i) => (
              <div
                key={`${item.created_at}-${i}`}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
              >
                <p className="text-white">{item.label}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {new Date(item.created_at).toLocaleString()} · {item.status}
                </p>
              </div>
            ))}
            {!data?.recentActivity?.length && (
              <p className="text-sm text-on-surface-variant">No recent activity</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

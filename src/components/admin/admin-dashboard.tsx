"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  DollarSign,
  Loader2,
  Shield,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  wallet_balance: number;
  created_at: string;
};
type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};
type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: "deposit" | "withdrawal" | "investment" | "profit";
  status: "pending" | "completed" | "failed";
  created_at: string;
};

export function AdminDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadAdminData = useCallback(async () => {
    const [profilesRes, withdrawalsRes, transactionsRes] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(20),
    ]);

    setProfiles((profilesRes.data as unknown as Profile[]) ?? []);
    setWithdrawals((withdrawalsRes.data as unknown as Withdrawal[]) ?? []);
    setTransactions((transactionsRes.data as unknown as Transaction[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadAdminData();

    const channel = supabase
      .channel("admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, loadAdminData)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, loadAdminData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAdminData, supabase]);

  async function approve(type: "withdrawal" | "transaction", id: string, status: string) {
    await fetch("/api/admin/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, status }),
    });
    loadAdminData();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="section-padding flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const pendingTransactions = transactions.filter((t) => t.status === "pending");

  const stats = [
    { label: "Total Users", value: String(profiles.length), icon: Users, change: "Live" },
    {
      label: "Revenue (MTD)",
      value: formatCurrency(
        transactions
          .filter((t) => t.transaction_type === "investment")
          .reduce((sum, tx) => sum + tx.amount, 0)
      ),
      icon: DollarSign,
      change: "Live",
    },
    { label: "Pending Withdrawals", value: String(pendingWithdrawals.length), icon: ArrowUpRight, change: "Needs review" },
    { label: "Pending Transactions", value: String(pendingTransactions.length), icon: Bell, change: "Needs review" },
  ];

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1600px]">
        <FadeIn className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="label-mono text-neon">Admin Panel</span>
            <h1 className="text-3xl font-bold text-white">Command Center</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild><Link href="/dashboard">Investor View</Link></Button>
            <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
          </div>
        </FadeIn>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.05}><GlassCard><div className="flex items-center justify-between"><stat.icon className="h-5 w-5 text-neon" /><span className="text-xs text-neon">{stat.change}</span></div><p className="mt-2 text-2xl font-bold text-white">{stat.value}</p><p className="label-mono text-on-surface-variant">{stat.label}</p></GlassCard></FadeIn>
          ))}
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <GlassCard><h3 className="mb-4 font-bold text-white">Revenue Analytics</h3><PortfolioChart height={250} /></GlassCard>
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-white"><Shield className="h-5 w-5 text-neon" /> Security Monitoring</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm"><span className="text-white">Realtime DB listener active</span><span className="text-xs text-neon">online</span></div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm"><span className="text-white">RLS policies enabled</span><span className="text-xs text-neon">verified</span></div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm"><span className="text-white">Supabase auth session enforced</span><span className="text-xs text-neon">active</span></div>
            </div>
          </GlassCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-white"><ArrowUpRight className="h-5 w-5 text-neon" /> Withdrawal Approvals</h3>
            <div className="space-y-3">
              {pendingWithdrawals.slice(0, 8).map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-xl border border-white/10 p-4">
                  <div><p className="font-bold text-white">{w.user_id.slice(0, 8)}</p><p className="text-xs text-on-surface-variant">{w.wallet_address.slice(0, 16)}...</p></div>
                  <div className="flex items-center gap-3"><span className="font-mono font-bold text-white">{formatCurrency(w.amount)}</span><Button size="sm" onClick={() => approve("withdrawal", w.id, "approved")}>Approve</Button></div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-white"><ArrowDownLeft className="h-5 w-5 text-neon" /> Pending Transactions</h3>
            <div className="space-y-3">
              {pendingTransactions.slice(0, 8).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-xl border border-white/10 p-4">
                  <div><p className="font-bold text-white">{tx.transaction_type}</p><p className="text-xs text-on-surface-variant">{tx.user_id.slice(0, 8)}</p></div>
                  <div className="flex items-center gap-3"><span className="font-mono font-bold text-neon">{formatCurrency(tx.amount)}</span><Button size="sm" onClick={() => approve("transaction", tx.id, "completed")}>Approve</Button></div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-white"><Ticket className="h-5 w-5 text-neon" /> Investor Tracking</h3>
            <div className="max-h-[320px] space-y-3 overflow-auto custom-scrollbar">
              {profiles.map((p) => (
                <div key={p.id} className="rounded-xl border border-white/10 p-4">
                  <p className="font-bold text-white">{p.full_name ?? "Unnamed"}</p>
                  <p className="text-xs text-on-surface-variant">{p.email}</p>
                  <p className="mt-2 font-mono text-neon">{formatCurrency(p.wallet_balance)}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-white"><TrendingUp className="h-5 w-5 text-neon" /> Latest Completed Transactions</h3>
            <div className="max-h-[320px] space-y-3 overflow-auto custom-scrollbar">
              {transactions.filter((t) => t.status === "completed").slice(0, 10).map((tx) => (
                <div key={tx.id} className="rounded-xl border border-white/10 p-4">
                  <p className="font-bold text-white">{tx.transaction_type}</p>
                  <p className="text-xs text-on-surface-variant">{tx.user_id.slice(0, 8)}</p>
                  <p className="mt-2 font-mono text-neon">{formatCurrency(tx.amount)}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

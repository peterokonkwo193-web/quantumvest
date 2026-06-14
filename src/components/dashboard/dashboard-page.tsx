"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Copy,
  LineChart,
  Loader2,
  LogOut,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { PortfolioChart, ProfitChart } from "@/components/charts/portfolio-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { investmentPlans } from "@/lib/data/investment-plans";
import { createClient } from "@/lib/supabase";
import { DepositFlow } from "@/components/dashboard/deposit-modal";
import { LiveCryptoChart } from "@/components/charts/live-crypto-chart";

type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: "deposit" | "withdrawal" | "investment" | "profit";
  status: "pending" | "completed" | "failed";
  created_at: string;
};
type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};
type UserInvestment = {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  expected_profit: number;
  status: "active" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
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
type UserProfile = {
  id: string;
  full_name: string | null;
  email: string;
  wallet_balance: number;
  created_at: string;
};

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(fullName: string | null | undefined): string {
  if (!fullName) return "Investor";
  return fullName.trim().split(/\s+/)[0];
}

export function DashboardPage() {
  const supabase = createClient();
  const isMountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeInvestments, setActiveInvestments] = useState<UserInvestment[]>([]);
  const [adminProfits, setAdminProfits] = useState<AdminProfit[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<Transaction[]>([]);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);



  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isMountedRef.current) return;
    setUserId(user.id);

    const [profileRes, txRes, notifRes, invRes, profitRes] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("user_investments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("profits")
        .select("id, amount, description, profit_type, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    if (!isMountedRef.current) return;
    const allTx = (txRes.data as unknown as Transaction[]) ?? [];
    setProfile((profileRes.data as unknown as UserProfile) ?? null);
    setTransactions(allTx.filter((t) => t.status !== "pending" || t.transaction_type !== "deposit"));
    setPendingDeposits(allTx.filter((t) => t.transaction_type === "deposit" && t.status === "pending"));
    setNotifications((notifRes.data as unknown as Notification[]) ?? []);
    setActiveInvestments((invRes.data as unknown as UserInvestment[]) ?? []);
    setAdminProfits((profitRes.data as unknown as AdminProfit[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    isMountedRef.current = true;
    load();

    const txChannel = supabase
      .channel("dashboard-transactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => load())
      .subscribe();

    const notificationChannel = supabase
      .channel("dashboard-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => load())
      .subscribe();

    // Reload when wallet balance or profile is updated (e.g. admin credits profit)
    const userChannel = supabase
      .channel("dashboard-user-balance")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users" }, () => load())
      .subscribe();

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(txChannel);
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(userChannel);
    };
  }, [load, supabase]);

  const totalProfit = useMemo(
    () => activeInvestments.reduce((sum, inv) => sum + inv.expected_profit, 0),
    [activeInvestments]
  );

  const activePlanId = activeInvestments[0]?.plan_id;
  const activePlan = activePlanId
    ? investmentPlans.find((p) => p.id === activePlanId) ?? investmentPlans.find((p) => p.id === "gold")
    : investmentPlans.find((p) => p.id === "gold");

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function submitWithdrawal() {
    if (!withdrawAmount || !walletAddress || withdrawSubmitting) return;
    setWithdrawSubmitting(true);
    setWithdrawError("");
    setWithdrawSuccess(false);
    try {
      const res = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(withdrawAmount), walletAddress }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWithdrawError(data.error ?? "Withdrawal failed. Please try again.");
        return;
      }
      setWithdrawAmount("");
      setWalletAddress("");
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 4000);
      load();
    } finally {
      setWithdrawSubmitting(false);
    }
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

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1600px]">
        <FadeIn className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="label-mono text-neon">Investor Terminal</span>
            <h1 className="mt-1 text-3xl font-bold text-white md:text-4xl">
              {greeting}, <span className="text-neon neon-glow-text">{firstName(profile?.full_name)}</span>
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">Here&apos;s what&apos;s happening with your investments today.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications((v) => !v)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon text-[10px] font-bold text-black">
                    {unreadCount}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl">
                  <p className="label-mono mb-3 text-on-surface-variant">Notifications</p>
                  <div className="space-y-2 text-sm">
                    {notifications.length === 0 ? (
                      <p className="text-on-surface-variant">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`rounded-lg border p-3 ${n.is_read ? "border-white/10" : "border-neon/20 bg-neon/5"}`}
                        >
                          <p className="font-bold text-white">{n.title}</p>
                          <p className="text-xs text-on-surface-variant">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" aria-label="Settings"><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out"><LogOut className="h-5 w-5" /></Button>
          </div>
        </FadeIn>

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 space-y-6 lg:col-span-3">
            <GlassCard className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-neon bg-neon/10 text-2xl font-bold text-neon">
                {profile?.full_name?.split(" ").map((v) => v[0]).join("").slice(0, 2) ?? "AW"}
              </div>
              <h2 className="font-bold text-white">{profile?.full_name ?? "QuantumVest Investor"}</h2>
              <p className="label-mono text-on-surface-variant">{profile?.email}</p>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <span className="text-on-surface-variant">Security</span>
                  <span className="font-bold text-neon">ALPHA-7</span>
                </div>
                <div className="flex justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <span className="text-on-surface-variant">KYC</span>
                  <span className="font-bold text-neon">Verified</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="label-mono mb-4 text-on-surface-variant">Live Markets</h3>
              <LiveCryptoChart compact />
            </GlassCard>

            <GlassCard>
              <h3 className="label-mono mb-2 text-on-surface-variant">Referral Code</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white/5 p-2 font-mono text-sm text-neon">
                  {userId?.slice(0, 8).toUpperCase()}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(userId?.slice(0, 8).toUpperCase() ?? "")}
                  aria-label="Copy referral code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">Earn 5% on referred deposits</p>
            </GlassCard>
          </aside>

          <div className="col-span-12 space-y-6 lg:col-span-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/dashboard/wallet">
                <GlassCard glow className="cursor-pointer transition-all hover:border-neon/50 hover:shadow-[0_0_30px_rgba(198,255,0,0.2)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-neon" />
                      <span className="label-mono text-on-surface-variant">Wallet Balance</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-neon/50" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(profile?.wallet_balance ?? 0)}</p>
                  <p className="text-sm text-neon">Tap to open wallet →</p>
                </GlassCard>
              </Link>
              <GlassCard>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-neon" />
                  <span className="label-mono text-on-surface-variant">Expected Profit</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-neon">{formatCurrency(totalProfit)}</p>
                <p className="text-sm text-on-surface-variant">Across active investments</p>
              </GlassCard>
            </div>

            <GlassCard><h3 className="mb-4 font-bold text-white">Portfolio Growth</h3><PortfolioChart height={280} /></GlassCard>
            <GlassCard><h3 className="mb-4 font-bold text-white">Profit Analytics</h3><ProfitChart height={180} /></GlassCard>

            {/* Trading History link card */}
            <Link href="/dashboard/trading">
              <GlassCard className="cursor-pointer transition-all hover:border-neon/50 hover:shadow-[0_0_30px_rgba(198,255,0,0.15)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon/30 bg-neon/10">
                      <LineChart className="h-5 w-5 text-neon" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Trading History</p>
                      <p className="text-sm text-on-surface-variant">
                        {transactions.length > 0
                          ? `${transactions.length} transaction${transactions.length === 1 ? "" : "s"} · tap to view all`
                          : "View all transactions & profits"}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neon/50" />
                </div>
                {transactions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {transactions.slice(0, 3).map((tx) => {
                      let planName: string | null = null;
                      try { planName = JSON.parse((tx as unknown as {notes: string}).notes ?? "{}").planName ?? null; } catch {}
                      const label =
                        tx.transaction_type === "profit" ? "Profit Credited by Admin"
                        : tx.transaction_type === "deposit" ? `Deposit${planName ? ` — ${planName}` : ""}`
                        : tx.transaction_type === "withdrawal" ? "Withdrawal"
                        : "Investment";
                      return (
                        <div key={tx.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                          <span className="text-on-surface-variant">{label}</span>
                          <span className={`font-mono font-bold ${tx.transaction_type === "withdrawal" ? "text-orange-400" : "text-neon"}`}>
                            {tx.transaction_type === "withdrawal" ? "-" : "+"}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                      );
                    })}
                    {transactions.length > 3 && (
                      <p className="pt-1 text-center text-xs text-neon">+{transactions.length - 3} more →</p>
                    )}
                  </div>
                )}
              </GlassCard>
            </Link>
          </div>

          <aside className="col-span-12 space-y-6 lg:col-span-3">
            {/* Pending Deposit Notice */}
            {pendingDeposits.length > 0 && (
              <GlassCard className="border-yellow-400/30 bg-yellow-400/5">
                <h3 className="label-mono mb-3 text-yellow-400">Pending Approval</h3>
                {pendingDeposits.map((dep) => {
                  let planName: string | null = null;
                  try { planName = JSON.parse((dep as unknown as {notes: string}).notes ?? "{}").planName ?? null; } catch {}
                  return (
                    <div key={dep.id} className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3 text-sm">
                      <p className="font-bold text-white">{formatCurrency(dep.amount)} deposit</p>
                      {planName && <p className="mt-0.5 text-xs text-yellow-300">For: {planName}</p>}
                      <p className="mt-1 text-xs text-on-surface-variant">Submitted {new Date(dep.created_at).toLocaleDateString()} · Awaiting admin approval</p>
                    </div>
                  );
                })}
              </GlassCard>
            )}

            {/* My Investment Plans */}
            <GlassCard glow>
              <h3 className="label-mono mb-4 text-neon">My Investment Plans</h3>
              {activeInvestments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-on-surface-variant">No active investments yet.</p>
                  <Link href="/plans" className="mt-2 inline-block text-xs text-neon hover:underline">Browse Plans →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeInvestments.map((inv) => {
                    const plan = investmentPlans.find((p) => p.id === inv.plan_id);
                    const start = new Date(inv.start_date);
                    const end = new Date(inv.end_date);
                    const now = new Date();
                    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
                    const elapsed = Math.min(totalDays, Math.round((now.getTime() - start.getTime()) / 86400000));
                    const progress = Math.round((elapsed / totalDays) * 100);
                    return (
                      <div key={inv.id} className="rounded-xl border border-neon/20 bg-neon/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">{plan?.name ?? inv.plan_id} Plan</span>
                          <span className="rounded-full bg-neon/20 px-2 py-0.5 text-[10px] font-bold text-neon">{plan?.roi ?? 0}% ROI</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between"><span className="text-on-surface-variant">Invested</span><span className="font-bold text-white">{formatCurrency(inv.amount)}</span></div>
                          <div className="flex justify-between"><span className="text-on-surface-variant">Expected Profit</span><span className="font-bold text-neon">{formatCurrency(inv.expected_profit)}</span></div>
                          <div className="flex justify-between"><span className="text-on-surface-variant">End Date</span><span className="text-white">{end.toLocaleDateString()}</span></div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-on-surface-variant mb-1">
                            <span>Progress</span><span>{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/10">
                            <div className="h-1.5 rounded-full bg-neon transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-sm">
                    <span className="text-on-surface-variant">Total Expected</span>
                    <span className="font-bold text-neon">{formatCurrency(totalProfit)}</span>
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <ArrowDownLeft className="h-5 w-5 text-neon" /> Deposit
              </h3>
              <DepositFlow onSuccess={load} />
            </GlassCard>

            <GlassCard>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                <ArrowUpRight className="h-5 w-5 text-neon" /> Withdraw
              </h3>
              <Input
                type="number"
                placeholder="Amount (USD)"
                value={withdrawAmount}
                min="1"
                onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawError(""); }}
              />
              <Input
                className="mt-3"
                placeholder="Wallet Address (BTC/ETH/TRX)"
                value={walletAddress}
                onChange={(e) => { setWalletAddress(e.target.value); setWithdrawError(""); }}
              />
              {withdrawError && <p className="mt-2 text-xs text-red-400">{withdrawError}</p>}
              {withdrawSuccess && <p className="mt-2 text-xs text-neon">Withdrawal request submitted!</p>}
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={submitWithdrawal}
                disabled={withdrawSubmitting || !withdrawAmount || !walletAddress}
              >
                {withdrawSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {withdrawSubmitting ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </GlassCard>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" asChild>
                <Link href="/security"><Shield className="mr-2 h-4 w-4" /> Security</Link>
              </Button>
              <Button variant="ghost" className="flex-1" asChild>
                <Link href="/plans"><Users className="mr-2 h-4 w-4" /> Plans</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

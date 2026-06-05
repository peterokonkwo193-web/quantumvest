"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

type AnalyticsData = {
  stats: Record<string, number>;
  chartData: { date: string; deposits: number; withdrawals: number; revenue: number; profits: number }[];
  recentActivity: { label: string; created_at: string; status: string }[];
};

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/analytics");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-analytics")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  const s = data?.stats ?? {};
  const barData = (data?.chartData ?? []).slice(-14).map((d) => ({
    name: d.date.slice(5),
    Deposits: d.deposits,
    Withdrawals: d.withdrawals,
    Profits: d.profits ?? 0,
  }));

  return (
    <div className="mx-auto max-w-[1600px]">
      <FadeIn className="mb-8">
        <span className="label-mono text-neon">Analytics</span>
        <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
      </FadeIn>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Deposits", value: formatCurrency(s.totalDeposits ?? 0) },
          { label: "Total Withdrawals", value: formatCurrency(s.totalWithdrawals ?? 0) },
          { label: "Revenue", value: formatCurrency(s.revenue ?? 0) },
          { label: "Profits Issued", value: formatCurrency(s.profitsIssued ?? 0) },
        ].map((card) => (
          <GlassCard key={card.label}>
            <p className="text-2xl font-bold text-neon">{card.value}</p>
            <p className="label-mono mt-1 text-on-surface-variant">{card.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 font-bold text-white">Revenue Trend</h3>
          <AdminRevenueChart data={data?.chartData ?? []} />
        </GlassCard>
        <GlassCard>
          <h3 className="mb-4 font-bold text-white">Deposits vs Withdrawals</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(198,255,0,0.3)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Bar dataKey="Deposits" fill="#C6FF00" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Withdrawals" fill="#666" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profits" fill="#86efac" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="mt-6">
        <h3 className="mb-4 font-bold text-white">Activity Feed</h3>
        <div className="space-y-2">
          {(data?.recentActivity ?? []).map((item, i) => (
            <div
              key={`${item.created_at}-${i}`}
              className="flex justify-between rounded-xl border border-white/10 p-3 text-sm"
            >
              <span className="text-white">{item.label}</span>
              <span className="text-on-surface-variant">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

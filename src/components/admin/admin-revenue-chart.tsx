"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  date: string;
  deposits?: number;
  withdrawals?: number;
  revenue?: number;
  profits?: number;
};

export function AdminRevenueChart({
  data,
  height = 280,
}: {
  data: ChartPoint[];
  height?: number;
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="neonGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C6FF00" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#C6FF00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="label" stroke="#888" fontSize={11} />
        <YAxis stroke="#888" fontSize={11} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{
            background: "rgba(0,0,0,0.9)",
            border: "1px solid rgba(198,255,0,0.3)",
            borderRadius: 12,
          }}
          labelStyle={{ color: "#C6FF00" }}
        />
        <Area
          type="monotone"
          dataKey="deposits"
          stroke="#C6FF00"
          fill="url(#neonGrad)"
          name="Deposits"
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#86efac"
          fill="transparent"
          name="Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

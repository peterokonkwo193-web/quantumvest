"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartData = [
  { name: "Jan", value: 4200, profit: 420 },
  { name: "Feb", value: 5800, profit: 580 },
  { name: "Mar", value: 7200, profit: 720 },
  { name: "Apr", value: 9100, profit: 910 },
  { name: "May", value: 11200, profit: 1120 },
  { name: "Jun", value: 14800, profit: 1480 },
  { name: "Jul", value: 18200, profit: 1820 },
];

interface PortfolioChartProps {
  height?: number;
  className?: string;
}

export function PortfolioChart({ height = 300, className }: PortfolioChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C6FF00" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#C6FF00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            stroke="#8d9479"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8d9479"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(17, 21, 8, 0.95)",
              border: "1px solid rgba(198, 255, 0, 0.3)",
              borderRadius: "12px",
              color: "#e1e4cf",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#C6FF00"
            strokeWidth={2}
            fill="url(#neonGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniSparkline({ data }: { data: number[] }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke="#C6FF00"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ProfitChart({ height = 200 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" stroke="#8d9479" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#8d9479" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "rgba(17, 21, 8, 0.95)",
            border: "1px solid rgba(198, 255, 0, 0.3)",
            borderRadius: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#C6FF00"
          strokeWidth={2}
          dot={{ fill: "#C6FF00", r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

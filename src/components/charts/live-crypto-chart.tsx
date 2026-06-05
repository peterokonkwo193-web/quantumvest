"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  mcap: number;
};

type ChartPoint = { time: number; price: number };

const COINS: { id: string; symbol: string; name: string; color: string }[] = [
  { id: "bitcoin",     symbol: "BTC", name: "Bitcoin",  color: "#F7931A" },
  { id: "ethereum",   symbol: "ETH", name: "Ethereum", color: "#627EEA" },
  { id: "solana",     symbol: "SOL", name: "Solana",   color: "#9945FF" },
  { id: "binancecoin",symbol: "BNB", name: "BNB",      color: "#F3BA2F" },
];

const TIMEFRAMES = [
  { label: "24H", days: "1" },
  { label: "7D",  days: "7" },
  { label: "30D", days: "30" },
  { label: "90D", days: "90" },
];

function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (n >= 1)    return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

function fmtTime(ts: number, days: string) {
  const d = new Date(ts);
  if (days === "1") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// Custom tooltip
function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: ChartPoint }[] }) {
  if (!active || !payload?.length) return null;
  const { price, time } = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-black/90 px-3 py-2 text-xs backdrop-blur">
      <p className="font-mono font-bold text-white">{fmtPrice(price)}</p>
      <p className="text-on-surface-variant">{new Date(time).toLocaleString("en-US")}</p>
    </div>
  );
}

export function LiveCryptoChart({ compact = false }: { compact?: boolean }) {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [selectedDays, setSelectedDays] = useState("7");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/crypto/prices");
      if (res.ok) {
        const data = await res.json();
        setPrices(data.prices ?? []);
        setLastUpdated(new Date());
      }
    } finally {
      setLoadingPrices(false);
    }
  }, []);

  const fetchChart = useCallback(async (coinId: string, days: string) => {
    setLoadingChart(true);
    try {
      const res = await fetch(`/api/crypto/chart/${coinId}?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setChartData(data.data ?? []);
      }
    } finally {
      setLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchPrices]);

  useEffect(() => {
    fetchChart(selectedCoin.id, selectedDays);
  }, [selectedCoin, selectedDays, fetchChart]);

  const activeCoinPrice = prices.find((p) => p.id === selectedCoin.id);
  const priceChange = activeCoinPrice?.change ?? 0;
  const isPositive = priceChange >= 0;

  const chartMin = chartData.length ? Math.min(...chartData.map((d) => d.price)) * 0.998 : 0;
  const chartMax = chartData.length ? Math.max(...chartData.map((d) => d.price)) * 1.002 : 0;

  return (
    <div className="space-y-4">
      {/* Price ticker cards */}
      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {(prices.length ? prices.filter((p) => COINS.find((c) => c.id === p.id)) : COINS.map((c) => ({ ...c, price: 0, change: 0, mcap: 0 }))).map((coin) => {
          const meta = COINS.find((c) => c.id === coin.id)!;
          const isUp = (coin.change ?? 0) >= 0;
          const isSelected = selectedCoin.id === coin.id;
          return (
            <button
              key={coin.id}
              onClick={() => {
                const c = COINS.find((x) => x.id === coin.id);
                if (c) setSelectedCoin(c);
              }}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-neon/40 bg-neon/5 shadow-[0_0_20px_rgba(198,255,0,0.1)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-extrabold text-black"
                    style={{ backgroundColor: meta?.color ?? "#C6FF00" }}
                  >
                    {coin.symbol?.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{coin.symbol}</p>
                    {!compact && <p className="text-[10px] text-on-surface-variant">{coin.name}</p>}
                  </div>
                </div>
                <span className={`label-mono text-[10px] font-bold flex items-center gap-0.5 ${isUp ? "text-green-400" : "text-red-400"}`}>
                  {isUp ? "+" : ""}{(coin.change ?? 0).toFixed(2)}%
                </span>
              </div>
              <p className="font-mono font-bold text-white">
                {coin.price > 0 ? fmtPrice(coin.price) : "—"}
              </p>
              {!compact && coin.mcap > 0 && (
                <p className="mt-0.5 text-[10px] text-on-surface-variant">MCap {fmt(coin.mcap)}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        {/* Chart header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedCoin.color }}
              />
              <span className="font-bold text-white">{selectedCoin.name} / USD</span>
              {activeCoinPrice && (
                <span className="font-mono text-lg font-bold text-white ml-1">
                  {fmtPrice(activeCoinPrice.price)}
                </span>
              )}
            </div>
            <div className={`mt-0.5 flex items-center gap-1 text-sm font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? "+" : ""}{priceChange.toFixed(2)}% (24h)
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timeframe selector */}
            <div className="flex rounded-xl border border-white/10 overflow-hidden">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.days}
                  onClick={() => setSelectedDays(tf.days)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                    selectedDays === tf.days
                      ? "bg-neon text-black"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {lastUpdated && (
              <button
                onClick={fetchPrices}
                title={`Updated ${lastUpdated.toLocaleTimeString()}`}
                className="text-on-surface-variant hover:text-neon"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Recharts area chart */}
        <div className={compact ? "h-48" : "h-72"}>
          {loadingChart ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-neon border-t-transparent" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
              Chart data unavailable
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={selectedCoin.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={selectedCoin.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) => fmtTime(t, selectedDays)}
                  tick={{ fill: "#888", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={60}
                />
                <YAxis
                  domain={[chartMin, chartMax]}
                  tickFormatter={(v) => fmtPrice(v)}
                  tick={{ fill: "#888", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={selectedCoin.color}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: selectedCoin.color, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {lastUpdated && !loadingPrices && (
          <p className="mt-2 text-right text-[10px] text-on-surface-variant/50">
            Prices updated {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 60s
          </p>
        )}
      </div>
    </div>
  );
}

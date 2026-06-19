"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TrendingDown, TrendingUp } from "lucide-react";

type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
};

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

export function PriceTicker() {
  const pathname = usePathname();
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/crypto/prices");
        if (!res.ok) return;
        const data = await res.json();
        if (active) setPrices(data.prices ?? []);
      } catch {
        // silent — ticker just stays empty until next refresh
      }
    }

    load();
    const interval = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (isAuthPage || prices.length === 0) return null;

  // Duplicate the list so the marquee loops seamlessly
  const items = [...prices, ...prices];

  return (
    <div className="fixed top-0 z-[60] w-full overflow-hidden border-b border-neon/10 bg-black/80 backdrop-blur-sm">
      <div className="ticker-track flex w-max items-center gap-10 py-2">
        {items.map((coin, i) => {
          const isUp = coin.change >= 0;
          return (
            <div key={`${coin.id}-${i}`} className="flex shrink-0 items-center gap-2 px-2">
              <span className="label-mono text-xs font-bold text-white">{coin.symbol}</span>
              <span className="font-mono text-xs text-on-surface-variant">{fmtPrice(coin.price)}</span>
              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>
                {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isUp ? "+" : ""}
                {coin.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

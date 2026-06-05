import { NextResponse } from "next/server";

const COINS = "bitcoin,ethereum,solana,tether,binancecoin";
const URL = `https://api.coingecko.com/api/v3/simple/price?ids=${COINS}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

export const revalidate = 60; // ISR-style cache, 60s

export async function GET() {
  try {
    const res = await fetch(URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const raw = await res.json();

    const prices = [
      { id: "bitcoin",     symbol: "BTC", name: "Bitcoin",  price: raw.bitcoin?.usd ?? 0,       change: raw.bitcoin?.usd_24h_change ?? 0,       mcap: raw.bitcoin?.usd_market_cap ?? 0 },
      { id: "ethereum",    symbol: "ETH", name: "Ethereum", price: raw.ethereum?.usd ?? 0,       change: raw.ethereum?.usd_24h_change ?? 0,       mcap: raw.ethereum?.usd_market_cap ?? 0 },
      { id: "solana",      symbol: "SOL", name: "Solana",   price: raw.solana?.usd ?? 0,         change: raw.solana?.usd_24h_change ?? 0,         mcap: raw.solana?.usd_market_cap ?? 0 },
      { id: "tether",      symbol: "USDT",name: "Tether",   price: raw.tether?.usd ?? 1.0,       change: raw.tether?.usd_24h_change ?? 0,         mcap: raw.tether?.usd_market_cap ?? 0 },
      { id: "binancecoin", symbol: "BNB", name: "BNB",      price: raw.binancecoin?.usd ?? 0,    change: raw.binancecoin?.usd_24h_change ?? 0,    mcap: raw.binancecoin?.usd_market_cap ?? 0 },
    ];

    return NextResponse.json({ prices, updatedAt: Date.now() });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch live prices. Retrying shortly." },
      { status: 503 }
    );
  }
}

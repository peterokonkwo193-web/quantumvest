import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ coin: string }> }
) {
  const { coin } = await params;
  const { searchParams } = new URL(request.url);
  const days = searchParams.get("days") ?? "7";

  const allowed = ["bitcoin", "ethereum", "solana", "binancecoin"];
  if (!allowed.includes(coin)) {
    return NextResponse.json({ error: "Invalid coin" }, { status: 400 });
  }

  const allowedDays = ["1", "7", "30", "90"];
  const safeDays = allowedDays.includes(days) ? days : "7";

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${safeDays}`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

    const raw = await res.json();

    // Downsample to at most 120 points for performance
    const prices: [number, number][] = raw.prices ?? [];
    const step = Math.max(1, Math.floor(prices.length / 120));
    const sampled = prices
      .filter((_: unknown, i: number) => i % step === 0)
      .map(([ts, price]: [number, number]) => ({
        time: ts,
        price: Math.round(price * 100) / 100,
      }));

    return NextResponse.json({ data: sampled, coin, days: safeDays });
  } catch {
    return NextResponse.json({ error: "Chart data unavailable" }, { status: 503 });
  }
}

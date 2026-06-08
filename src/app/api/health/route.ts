import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const results: Record<string, unknown> = {
    hasUrl: !!url,
    hasKey: !!key,
    urlPreview: url ? url.slice(0, 45) : "MISSING",
    keyPreview: key ? key.slice(0, 20) + "..." : "MISSING",
    nodeVersion: process.version,
  };

  // Test 1: can Vercel reach the internet at all?
  try {
    const r = await fetch("https://httpbin.org/get", { signal: AbortSignal.timeout(5000) });
    results.internetReachable = r.status === 200;
    results.internetStatus = r.status;
  } catch (e) {
    results.internetReachable = false;
    results.internetError = e instanceof Error ? e.message : "unknown";
  }

  // Test 2: can Vercel reach Supabase auth health?
  if (url && key) {
    try {
      const r = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: key },
        signal: AbortSignal.timeout(8000),
      });
      results.supabaseReachable = r.status === 200;
      results.supabaseStatus = r.status;
      results.supabaseBody = await r.text();
    } catch (e) {
      results.supabaseReachable = false;
      results.supabaseError = e instanceof Error ? e.message : "unknown";
      if (e instanceof Error && "cause" in e) {
        results.supabaseCause = String((e as NodeJS.ErrnoException).cause);
      }
    }
  }

  // Test 3: can Vercel reach Supabase REST API?
  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: key },
        signal: AbortSignal.timeout(8000),
      });
      results.supabaseRestStatus = r.status;
    } catch (e) {
      results.supabaseRestError = e instanceof Error ? e.message : "unknown";
    }
  }

  return NextResponse.json(results, { headers: { "Cache-Control": "no-store" } });
}

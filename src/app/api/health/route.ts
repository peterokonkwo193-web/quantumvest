import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasUrl = !!url;
  const hasKey = !!key;
  const urlPreview = url ? url.slice(0, 40) : "MISSING";
  const keyPreview = key ? key.slice(0, 20) + "..." : "MISSING";

  let supabaseReachable = false;
  let supabaseStatus = 0;
  let supabaseError = "";

  if (url && key) {
    try {
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: key },
      });
      supabaseStatus = res.status;
      supabaseReachable = res.status === 200;
    } catch (e) {
      supabaseError = e instanceof Error ? e.message : "unknown";
    }
  }

  return NextResponse.json({
    hasUrl,
    hasKey,
    urlPreview,
    keyPreview,
    supabaseReachable,
    supabaseStatus,
    supabaseError,
  });
}

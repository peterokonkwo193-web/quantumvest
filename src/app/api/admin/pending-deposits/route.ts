import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;

  const supabase = createAdminSupabaseClient();

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("transaction_type", "deposit")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const userIds = [...new Set((transactions ?? []).map((t) => t.user_id))];

  const { data: users } = userIds.length
    ? await supabase
        .from("users")
        .select("id, full_name, email, wallet_balance, kyc_status, created_at")
        .in("id", userIds)
    : { data: [] };

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const enriched = (transactions ?? []).map((tx) => {
    const user = userMap.get(tx.user_id) ?? null;
    let notes: Record<string, string | null> = {};
    try {
      notes = JSON.parse(tx.notes ?? "{}");
    } catch {}
    return {
      id: tx.id,
      user_id: tx.user_id,
      amount: tx.amount,
      status: tx.status,
      created_at: tx.created_at,
      user_full_name: user?.full_name ?? null,
      user_email: user?.email ?? null,
      user_wallet_balance: user?.wallet_balance ?? 0,
      user_kyc_status: user?.kyc_status ?? null,
      user_joined: user?.created_at ?? null,
      crypto_type: notes.cryptoType ?? null,
      network: notes.network ?? null,
      tx_hash: notes.txHash ?? null,
      wallet_address: notes.walletAddress ?? null,
      plan_name: notes.planName ?? null,
    };
  });

  return NextResponse.json({ deposits: enriched, total: enriched.length });
}

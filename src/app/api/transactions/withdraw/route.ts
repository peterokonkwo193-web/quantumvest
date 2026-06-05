import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const WALLET_RE =
  /^(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{6,87}|T[A-Za-z1-9]{33})$/;

const schema = z.object({
  amount: z.number().positive("Amount must be greater than 0").finite(),
  walletAddress: z
    .string()
    .min(1, "Wallet address is required")
    .regex(WALLET_RE, "Invalid wallet address format"),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_suspended, wallet_balance")
    .eq("id", user.id)
    .single();

  if (profile?.is_suspended) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  const { amount, walletAddress } = parsed.data;

  if (!profile || profile.wallet_balance < amount) {
    return NextResponse.json(
      { error: "Insufficient wallet balance" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("withdrawals").insert({
    user_id: user.id,
    amount,
    wallet_address: walletAddress,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("transactions").insert({
    user_id: user.id,
    amount,
    transaction_type: "withdrawal",
    status: "pending",
  });

  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Withdrawal Requested",
    message: `Withdrawal request for $${amount.toLocaleString()} is pending approval.`,
  });

  return NextResponse.json({ success: true });
}

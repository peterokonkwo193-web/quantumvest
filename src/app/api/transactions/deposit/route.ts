import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const schema = z.object({
  amount: z.number().positive("Amount must be greater than 0").finite(),
  cryptoType: z.string().max(10).optional(),
  network: z.string().max(20).optional(),
  txHash: z.string().max(200).nullable().optional(),
  walletAddress: z.string().max(200).optional(),
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
    .select("is_suspended")
    .eq("id", user.id)
    .single();

  if (profile?.is_suspended) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  const { amount, cryptoType, network, txHash, walletAddress } = parsed.data;

  const notes = JSON.stringify({
    cryptoType: cryptoType ?? null,
    network: network ?? null,
    txHash: txHash ?? null,
    walletAddress: walletAddress ?? null,
  });

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount,
    transaction_type: "deposit",
    status: "pending",
    notes,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Deposit Submitted",
    message: `Deposit request for $${amount.toLocaleString()} is pending approval.`,
  });

  return NextResponse.json({ success: true });
}

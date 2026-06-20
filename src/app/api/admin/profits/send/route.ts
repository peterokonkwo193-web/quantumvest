import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { sendProfitEmail } from "@/lib/emailjs";

const schema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  amount: z.number().positive("Amount must be greater than 0").finite(),
  profit_type: z.enum(["manual", "roi", "bonus", "referral"]).default("manual"),
  description: z.string().max(300).optional().nullable(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { user: adminUser } = auth;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { user_id, amount, profit_type, description } = parsed.data;
  const supabase = createAdminSupabaseClient();

  // Verify user exists
  const { data: targetUser, error: userErr } = await supabase
    .from("users")
    .select("id, full_name, email, wallet_balance")
    .eq("id", user_id)
    .single();

  if (userErr || !targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Create profit record marked as paid
  const { data: profit, error: profitErr } = await supabase
    .from("profits")
    .insert({
      user_id,
      profit_type,
      amount,
      description: description ?? null,
      status: "paid",
      issued_by: adminUser.id,
    })
    .select()
    .single();

  if (profitErr || !profit) {
    return NextResponse.json(
      { error: profitErr?.message ?? "Failed to create profit record" },
      { status: 400 }
    );
  }

  // Credit wallet balance
  const newBalance = Number(targetUser.wallet_balance) + amount;
  const { error: balanceErr } = await supabase
    .from("users")
    .update({ wallet_balance: newBalance })
    .eq("id", user_id);

  if (balanceErr) {
    // Rollback profit record
    await supabase.from("profits").delete().eq("id", profit.id);
    return NextResponse.json({ error: "Failed to credit wallet balance" }, { status: 500 });
  }

  // Create a completed profit transaction so it shows in the client's history
  await supabase.from("transactions").insert({
    user_id,
    amount,
    transaction_type: "profit",
    status: "completed",
    notes: JSON.stringify({
      profit_id: profit.id,
      type: profit_type,
      description: description ?? null,
      issued_by: adminUser.id,
    }),
  });

  // Send notification to the client
  const label = profit_type === "bonus"
    ? "Bonus Reward"
    : profit_type === "referral"
    ? "Referral Commission"
    : profit_type === "roi"
    ? "ROI Profit"
    : "Profit";

  await supabase.from("notifications").insert({
    user_id,
    title: `${label} Credited`,
    message: `$${amount.toLocaleString()} has been credited to your wallet balance${description ? ` — ${description}` : ""}.`,
  });

  // Send email notification to client
  let emailStatus: string;
  try {
    await sendProfitEmail({
      toName:      targetUser.full_name ?? "",
      toEmail:     targetUser.email,
      profitLabel: label,
      amount,
      description,
      newBalance,
    });
    emailStatus = "sent";
  } catch (err) {
    emailStatus = err instanceof Error ? err.message : String(err);
    console.error("[Email] Profit email failed:", emailStatus);
  }

  return NextResponse.json({
    success: true,
    profit,
    new_balance: newBalance,
    user_name: targetUser.full_name ?? targetUser.email,
    email_status: emailStatus,
  });
}

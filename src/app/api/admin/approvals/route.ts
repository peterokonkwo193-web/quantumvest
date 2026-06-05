import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { sendDepositApprovedEmail, sendWithdrawalApprovedEmail } from "@/lib/emailjs";

const schema = z.object({
  type: z.enum(["withdrawal", "transaction", "deposit", "kyc"]),
  id: z.string().min(1, "ID is required"),
  status: z.string().optional(),
  action: z.enum(["approve", "reject"]).optional(),
});

async function getUserDetails(userId: string) {
  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase
      .from("users")
      .select("full_name, email, wallet_balance")
      .eq("id", userId)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;
  const { user, supabase } = auth;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { type, id, status, action } = parsed.data;

  try {
    if (type === "withdrawal") {
      const { data: withdrawal } = await supabase
        .from("withdrawals")
        .select("status, user_id, amount, wallet_address")
        .eq("id", id)
        .single();

      if (!withdrawal) {
        return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
      }
      if (withdrawal.status !== "pending") {
        return NextResponse.json(
          { error: `Withdrawal already ${withdrawal.status}` },
          { status: 409 }
        );
      }

      if (status === "approved" || action === "approve") {
        const { error } = await supabase.rpc("approve_withdrawal", {
          p_withdrawal_id: id,
          p_admin_id: user.id,
        });
        if (error) throw error;

        // Send withdrawal approval email
        getUserDetails(withdrawal.user_id).then((profile) => {
          if (profile?.email) {
            sendWithdrawalApprovedEmail({
              toName:        profile.full_name ?? "",
              toEmail:       profile.email,
              amount:        withdrawal.amount,
              walletAddress: withdrawal.wallet_address,
            }).catch(() => {});
          }
        });
      } else if (status === "rejected" || action === "reject") {
        const { error } = await supabase.rpc("reject_withdrawal", {
          p_withdrawal_id: id,
          p_admin_id: user.id,
        });
        if (error) throw error;
      }
    } else if (type === "transaction" || type === "deposit") {
      const { data: tx } = await supabase
        .from("transactions")
        .select("status, user_id, amount, notes")
        .eq("id", id)
        .single();

      if (!tx) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }
      if (tx.status !== "pending") {
        return NextResponse.json(
          { error: `Transaction already ${tx.status}` },
          { status: 409 }
        );
      }

      if (status === "completed" || action === "approve") {
        const { error } = await supabase.rpc("approve_deposit", {
          p_transaction_id: id,
          p_admin_id: user.id,
        });
        if (error) throw error;

        // Send deposit confirmed email
        getUserDetails(tx.user_id).then((profile) => {
          if (profile?.email) {
            sendDepositApprovedEmail({
              toName:     profile.full_name ?? "",
              toEmail:    profile.email,
              amount:     tx.amount,
              newBalance: Number(profile.wallet_balance) + tx.amount,
            }).catch(() => {});
          }
        });
      } else if (status === "failed" || action === "reject") {
        const { error } = await supabase
          .from("transactions")
          .update({ status: "failed" })
          .eq("id", id);
        if (error) throw error;
      }
    } else if (type === "kyc") {
      const { error } = await supabase.rpc("update_kyc_status", {
        p_user_id: id,
        p_status: status,
        p_notes: null,
      });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Approval failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { isAdminResponse, requireAdmin } from "@/lib/admin-auth";
import { sendProfitEmail } from "@/lib/emailjs";

export async function GET() {
  const auth = await requireAdmin();
  if (isAdminResponse(auth)) return auth;

  const { user } = auth;

  // Send a test profit email to the admin's own email
  const testEmail = user.email ?? "";
  const testName  = user.user_metadata?.full_name ?? "Admin";

  let status: string;
  let success = false;

  try {
    await sendProfitEmail({
      toName:      testName,
      toEmail:     testEmail,
      profitLabel: "Test Profit",
      amount:      1.00,
      description: "This is a test email sent from the QuantumVest admin panel.",
      newBalance:  1.00,
    });
    status  = "sent";
    success = true;
  } catch (err) {
    status = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    success,
    email_sent_to: testEmail,
    status,
    env: {
      EMAILJS_SERVICE_ID:       process.env.EMAILJS_SERVICE_ID     ? "✅ set" : "❌ missing",
      EMAILJS_PUBLIC_KEY:       process.env.EMAILJS_PUBLIC_KEY      ? "✅ set" : "❌ missing",
      EMAILJS_PRIVATE_KEY:      process.env.EMAILJS_PRIVATE_KEY     ? "✅ set" : "❌ missing",
      EMAILJS_TEMPLATE_PROFIT:  process.env.EMAILJS_TEMPLATE_PROFIT ?? "❌ missing",
    },
  });
}

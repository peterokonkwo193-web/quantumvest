const EMAILJS_API = "https://api.emailjs.com/api/v1.0/email/send";

const SERVICE_ID   = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY   = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY  = process.env.EMAILJS_PRIVATE_KEY;

const PLATFORM = "QuantumVest";
const DASHBOARD_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
  : "https://quantumvest.com/dashboard";

function isConfigured() {
  return !!(SERVICE_ID && PUBLIC_KEY && PRIVATE_KEY);
}

async function send(templateId: string, params: Record<string, string>) {
  if (!isConfigured() || !templateId || templateId.startsWith("your_")) {
    console.warn("[EmailJS] Not configured — skipping email send.");
    return;
  }

  try {
    const res = await fetch(EMAILJS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: templateId,
        user_id: PUBLIC_KEY,
        accessToken: PRIVATE_KEY,
        template_params: params,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("[EmailJS] Send failed:", res.status, msg);
    }
  } catch (err) {
    console.error("[EmailJS] Network error:", err);
  }
}

// ── Email: Profit credited ────────────────────────────────
export async function sendProfitEmail({
  toName,
  toEmail,
  profitLabel,
  amount,
  description,
  newBalance,
}: {
  toName: string;
  toEmail: string;
  profitLabel: string;
  amount: number;
  description?: string | null;
  newBalance: number;
}) {
  const templateId = process.env.EMAILJS_TEMPLATE_PROFIT ?? "";
  await send(templateId, {
    to_name:       toName || "Investor",
    to_email:      toEmail,
    profit_label:  profitLabel,
    profit_amount: `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    description:   description || "No additional notes.",
    new_balance:   `$${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    platform_name: PLATFORM,
    dashboard_url: DASHBOARD_URL,
    date:          new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }),
  });
}

// ── Email: Deposit approved ───────────────────────────────
export async function sendDepositApprovedEmail({
  toName,
  toEmail,
  amount,
  newBalance,
}: {
  toName: string;
  toEmail: string;
  amount: number;
  newBalance: number;
}) {
  const templateId = process.env.EMAILJS_TEMPLATE_DEPOSIT ?? "";
  await send(templateId, {
    to_name:       toName || "Investor",
    to_email:      toEmail,
    deposit_amount:`$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    new_balance:   `$${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    platform_name: PLATFORM,
    dashboard_url: DASHBOARD_URL,
    date:          new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }),
  });
}

// ── Email: Withdrawal approved ────────────────────────────
// Reuses the deposit template — maps withdrawal fields to deposit template variables
export async function sendWithdrawalApprovedEmail({
  toName,
  toEmail,
  amount,
  walletAddress,
}: {
  toName: string;
  toEmail: string;
  amount: number;
  walletAddress: string;
}) {
  const templateId = process.env.EMAILJS_TEMPLATE_WITHDRAWAL ?? "";
  const fmtAmount = `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  await send(templateId, {
    to_name:        toName || "Investor",
    to_email:       toEmail,
    // Map to deposit template variable names
    deposit_amount: fmtAmount,
    new_balance:    `Sent to: ${walletAddress}`,
    platform_name:  PLATFORM,
    dashboard_url:  DASHBOARD_URL,
    date:           new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }),
  });
}

const EMAILJS_API = "https://api.emailjs.com/api/v1.0/email/send";

const SERVICE_ID  = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY  = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

const PLATFORM = "QuantumVest";
const DASHBOARD_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
  : "https://quantumvest-black.vercel.app/dashboard";

function isConfigured() {
  return !!(SERVICE_ID && PUBLIC_KEY && PRIVATE_KEY);
}

// Throws on failure so callers can catch and log the reason
async function send(templateId: string, params: Record<string, string>) {
  if (!isConfigured()) {
    throw new Error("EmailJS not configured — missing SERVICE_ID, PUBLIC_KEY or PRIVATE_KEY");
  }
  if (!templateId || templateId.startsWith("your_")) {
    throw new Error(`EmailJS template ID is invalid: "${templateId}"`);
  }

  const res = await fetch(EMAILJS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id:      SERVICE_ID,
      template_id:     templateId,
      user_id:         PUBLIC_KEY,
      accessToken:     PRIVATE_KEY,
      template_params: params,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`EmailJS API error ${res.status}: ${body}`);
  }

  return body; // "OK" on success
}

// ── Profit credited ───────────────────────────────────────────
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
  return send(templateId, {
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

// ── Deposit approved ──────────────────────────────────────────
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
  return send(templateId, {
    to_name:        toName || "Investor",
    to_email:       toEmail,
    deposit_amount: `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    new_balance:    `$${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    platform_name:  PLATFORM,
    dashboard_url:  DASHBOARD_URL,
    date:           new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }),
  });
}

// ── Withdrawal approved ───────────────────────────────────────
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
  return send(templateId, {
    to_name:        toName || "Investor",
    to_email:       toEmail,
    deposit_amount: fmtAmount,
    new_balance:    `Sent to: ${walletAddress}`,
    platform_name:  PLATFORM,
    dashboard_url:  DASHBOARD_URL,
    date:           new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" }),
  });
}

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER;

const PLATFORM = "QuantumVest";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quantumvest-black.vercel.app";
const DASHBOARD_URL = `${SITE_URL}/dashboard`;

function isConfigured() {
  return !!(SMTP_USER && SMTP_PASS);
}

function createTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${PLATFORM}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0d1a00 0%,#162800 100%);padding:28px 40px;text-align:center;">
            <div style="font-size:20px;font-weight:900;color:#C6FF00;letter-spacing:-0.5px;">⚡ QUANTUMVEST</div>
            <div style="font-size:11px;color:#6a7a40;margin-top:3px;font-family:monospace;letter-spacing:2px;">INVESTMENT PLATFORM</div>
          </td>
        </tr>
        <tr><td style="padding:36px 40px;">${content}</td></tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1e1e1e;text-align:center;">
            <p style="color:#444;font-size:12px;margin:0;">© ${new Date().getFullYear()} ${PLATFORM}. This is an automated notification — do not reply.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
  if (!isConfigured()) {
    console.warn("[Mailer] SMTP not configured — set SMTP_USER and SMTP_PASS in Vercel env vars.");
    return;
  }

  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const name = toName || "Investor";
  const date = new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" });

  const noteBlock = description
    ? `<div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:20px;">
        <div style="font-size:11px;color:#666;font-family:monospace;letter-spacing:1px;margin-bottom:6px;">NOTE FROM TEAM</div>
        <div style="color:#ccc;font-size:14px;line-height:1.5;">${description}</div>
       </div>`
    : "";

  const html = baseTemplate(`
    <h2 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 16px;">
      💰 ${profitLabel} Credited
    </h2>
    <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 28px;">
      Hi ${name},<br><br>
      Your <strong style="color:#fff;">${profitLabel.toLowerCase()}</strong> has been credited to your ${PLATFORM} wallet.
    </p>

    <div style="background:linear-gradient(135deg,#0d1a00 0%,#162800 100%);border:1px solid rgba(198,255,0,0.35);border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;color:#7a9a00;font-family:monospace;letter-spacing:2px;margin-bottom:10px;">AMOUNT CREDITED</div>
      <div style="font-size:44px;font-weight:900;color:#C6FF00;">${fmt(amount)}</div>
      <div style="font-size:13px;color:#888;margin-top:14px;">
        New Wallet Balance:&nbsp;<strong style="color:#fff;font-size:15px;">${fmt(newBalance)}</strong>
      </div>
    </div>

    ${noteBlock}

    <div style="background:#1a1a1a;border-radius:8px;padding:14px 16px;margin-bottom:28px;">
      <div style="font-size:11px;color:#666;font-family:monospace;letter-spacing:1px;margin-bottom:4px;">DATE</div>
      <div style="color:#ccc;font-size:14px;">${date}</div>
    </div>

    <div style="text-align:center;">
      <a href="${DASHBOARD_URL}" style="display:inline-block;background:#C6FF00;color:#000;font-weight:800;font-size:14px;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
        VIEW DASHBOARD →
      </a>
    </div>
  `);

  const text = `Hi ${name},\n\nYour ${profitLabel} of ${fmt(amount)} has been credited to your ${PLATFORM} wallet.\n\nNew Balance: ${fmt(newBalance)}\n${description ? `\nNote: ${description}\n` : ""}\nDate: ${date}\n\nDashboard: ${DASHBOARD_URL}`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"${PLATFORM}" <${SMTP_FROM}>`,
    to: toEmail,
    subject: `🎉 ${profitLabel} of ${fmt(amount)} Credited — ${PLATFORM}`,
    html,
    text,
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
  if (!isConfigured()) {
    console.warn("[Mailer] SMTP not configured — skipping deposit email.");
    return;
  }

  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const name = toName || "Investor";
  const date = new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" });

  const html = baseTemplate(`
    <h2 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 16px;">
      ✅ Deposit Approved
    </h2>
    <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 28px;">
      Hi ${name},<br><br>
      Your deposit has been verified and credited to your ${PLATFORM} wallet. Your investment is now active.
    </p>

    <div style="background:linear-gradient(135deg,#0d1a00 0%,#162800 100%);border:1px solid rgba(198,255,0,0.35);border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;color:#7a9a00;font-family:monospace;letter-spacing:2px;margin-bottom:10px;">DEPOSIT CREDITED</div>
      <div style="font-size:44px;font-weight:900;color:#C6FF00;">${fmt(amount)}</div>
      <div style="font-size:13px;color:#888;margin-top:14px;">
        New Wallet Balance:&nbsp;<strong style="color:#fff;font-size:15px;">${fmt(newBalance)}</strong>
      </div>
    </div>

    <div style="background:#1a1a1a;border-radius:8px;padding:14px 16px;margin-bottom:28px;">
      <div style="font-size:11px;color:#666;font-family:monospace;letter-spacing:1px;margin-bottom:4px;">APPROVED ON</div>
      <div style="color:#ccc;font-size:14px;">${date}</div>
    </div>

    <div style="text-align:center;">
      <a href="${DASHBOARD_URL}" style="display:inline-block;background:#C6FF00;color:#000;font-weight:800;font-size:14px;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
        VIEW DASHBOARD →
      </a>
    </div>
  `);

  const text = `Hi ${name},\n\nYour deposit of ${fmt(amount)} has been approved and credited to your ${PLATFORM} wallet.\n\nNew Balance: ${fmt(newBalance)}\nDate: ${date}\n\nDashboard: ${DASHBOARD_URL}`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"${PLATFORM}" <${SMTP_FROM}>`,
    to: toEmail,
    subject: `✅ Deposit of ${fmt(amount)} Approved — ${PLATFORM}`,
    html,
    text,
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
  if (!isConfigured()) {
    console.warn("[Mailer] SMTP not configured — skipping withdrawal email.");
    return;
  }

  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const name = toName || "Investor";
  const date = new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" });

  const html = baseTemplate(`
    <h2 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 16px;">
      🚀 Withdrawal Processed
    </h2>
    <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 28px;">
      Hi ${name},<br><br>
      Your withdrawal request has been approved and processed. The funds are on their way to your wallet.
    </p>

    <div style="background:linear-gradient(135deg,#0d1a00 0%,#162800 100%);border:1px solid rgba(198,255,0,0.35);border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;color:#7a9a00;font-family:monospace;letter-spacing:2px;margin-bottom:10px;">WITHDRAWAL AMOUNT</div>
      <div style="font-size:44px;font-weight:900;color:#C6FF00;">${fmt(amount)}</div>
    </div>

    <div style="background:#1a1a1a;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
      <div style="font-size:11px;color:#666;font-family:monospace;letter-spacing:1px;margin-bottom:4px;">DESTINATION WALLET</div>
      <div style="color:#ccc;font-size:13px;word-break:break-all;font-family:monospace;">${walletAddress}</div>
    </div>

    <div style="background:#1a1a1a;border-radius:8px;padding:14px 16px;margin-bottom:28px;">
      <div style="font-size:11px;color:#666;font-family:monospace;letter-spacing:1px;margin-bottom:4px;">PROCESSED ON</div>
      <div style="color:#ccc;font-size:14px;">${date}</div>
    </div>

    <div style="text-align:center;">
      <a href="${DASHBOARD_URL}" style="display:inline-block;background:#C6FF00;color:#000;font-weight:800;font-size:14px;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
        VIEW DASHBOARD →
      </a>
    </div>
  `);

  const text = `Hi ${name},\n\nYour withdrawal of ${fmt(amount)} has been approved and sent to: ${walletAddress}\n\nDate: ${date}\n\nDashboard: ${DASHBOARD_URL}`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"${PLATFORM}" <${SMTP_FROM}>`,
    to: toEmail,
    subject: `🚀 Withdrawal of ${fmt(amount)} Processed — ${PLATFORM}`,
    html,
    text,
  });
}

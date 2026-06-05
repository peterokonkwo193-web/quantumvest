"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

type EnrichedDeposit = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  user_full_name: string | null;
  user_email: string | null;
  user_wallet_balance: number;
  user_kyc_status: string | null;
  user_joined: string | null;
  crypto_type: string | null;
  network: string | null;
  tx_hash: string | null;
  wallet_address: string | null;
};

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string;
  status: string;
  created_at: string;
};

const CRYPTO_COLORS: Record<string, string> = {
  BTC: "text-[#F7931A] border-[#F7931A44] bg-[#F7931A11]",
  USDT: "text-[#26A17B] border-[#26A17B44] bg-[#26A17B11]",
  ETH: "text-[#627EEA] border-[#627EEA44] bg-[#627EEA11]",
};

function CryptoBadge({ type, network }: { type: string | null; network: string | null }) {
  if (!type) return null;
  const cls = CRYPTO_COLORS[type] ?? "text-white border-white/20 bg-white/5";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls}`}>
      {type}{network ? ` · ${network}` : ""}
    </span>
  );
}

function DepositCard({
  deposit,
  processing,
  onApprove,
  onReject,
}: {
  deposit: EnrichedDeposit;
  processing: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isProcessing = processing === deposit.id;
  const displayName = deposit.user_full_name ?? deposit.user_email ?? deposit.user_id.slice(0, 12);
  const initials = (deposit.user_full_name ?? deposit.user_email ?? "??")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-3 p-4">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neon/30 bg-neon/10 text-sm font-bold text-neon">
          {initials}
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white">{displayName}</span>
            <CryptoBadge type={deposit.crypto_type} network={deposit.network} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
            <span className="font-bold text-neon text-sm">{formatCurrency(deposit.amount)}</span>
            <span>{new Date(deposit.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onApprove(deposit.id)}
              disabled={isProcessing}
              className="gap-1"
            >
              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReject(deposit.id)}
              disabled={isProcessing}
              className="gap-1 text-red-400 hover:text-red-300"
            >
              <XCircle className="h-3 w-3" />
              Reject
            </Button>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-on-surface-variant hover:text-neon"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Hide" : "Client Details"}
          </button>
        </div>
      </div>

      {/* TX Hash row */}
      {deposit.tx_hash && (
        <div className="border-t border-white/5 bg-white/[0.02] px-4 py-2">
          <p className="text-[10px] text-on-surface-variant mb-0.5">Transaction Hash (payment proof)</p>
          <p className="break-all font-mono text-[10px] text-neon">{deposit.tx_hash}</p>
        </div>
      )}
      {!deposit.tx_hash && (
        <div className="border-t border-white/5 px-4 py-2">
          <p className="text-[10px] text-on-surface-variant/50 italic">No transaction hash submitted by client</p>
        </div>
      )}

      {/* Expanded client details */}
      {expanded && (
        <div className="border-t border-white/10 bg-white/[0.03] p-4 space-y-3">
          <p className="label-mono text-[10px] text-neon mb-2">Client Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <User className="h-3.5 w-3.5 mt-0.5 shrink-0 text-on-surface-variant" />
              <div>
                <p className="text-[10px] text-on-surface-variant">Full Name</p>
                <p className="text-xs font-bold text-white">{deposit.user_full_name ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0 text-on-surface-variant" />
              <div>
                <p className="text-[10px] text-on-surface-variant">Email</p>
                <p className="text-xs font-bold text-white break-all">{deposit.user_email ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Wallet className="h-3.5 w-3.5 mt-0.5 shrink-0 text-on-surface-variant" />
              <div>
                <p className="text-[10px] text-on-surface-variant">Wallet Balance</p>
                <p className="text-xs font-bold text-white">{formatCurrency(deposit.user_wallet_balance)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-on-surface-variant" />
              <div>
                <p className="text-[10px] text-on-surface-variant">KYC Status</p>
                <p className={`text-xs font-bold ${deposit.user_kyc_status === "approved" ? "text-neon" : "text-yellow-400"}`}>
                  {deposit.user_kyc_status ?? "—"}
                </p>
              </div>
            </div>
          </div>
          {deposit.wallet_address && (
            <div>
              <p className="text-[10px] text-on-surface-variant mb-0.5">Client Sent To</p>
              <p className="break-all font-mono text-[10px] text-on-surface-variant">{deposit.wallet_address}</p>
            </div>
          )}
          {deposit.user_joined && (
            <p className="text-[10px] text-on-surface-variant/50">
              Member since {new Date(deposit.user_joined).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminTransactions() {
  const [deposits, setDeposits] = useState<EnrichedDeposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadDeposits = useCallback(async () => {
    const res = await fetch("/api/admin/pending-deposits");
    if (res.ok) {
      const data = await res.json();
      setDeposits(data.deposits ?? []);
    }
  }, []);

  const loadWithdrawals = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);
    setWithdrawals((data as Withdrawal[]) ?? []);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadDeposits(), loadWithdrawals()]);
    setLoading(false);
  }, [loadDeposits, loadWithdrawals]);

  useEffect(() => {
    loadAll();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-tx-v2")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, loadDeposits)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "transactions" }, loadDeposits)
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, loadWithdrawals)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll, loadDeposits, loadWithdrawals]);

  async function approve(type: string, id: string, action: "approve" | "reject") {
    setProcessing(id);
    await fetch("/api/admin/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        id,
        action,
        status: action === "approve" ? (type === "withdrawal" ? "approved" : "completed") : "rejected",
      }),
    });
    await loadAll();
    setProcessing(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <FadeIn className="mb-8">
        <span className="label-mono text-neon">Approvals Queue</span>
        <h1 className="text-3xl font-bold text-white">Pending Payments</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {deposits.length} pending deposit{deposits.length !== 1 ? "s" : ""} ·{" "}
          {withdrawals.length} pending withdrawal{withdrawals.length !== 1 ? "s" : ""}
        </p>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Deposits */}
        <div>
          <GlassCard>
            <h3 className="mb-4 font-bold text-white flex items-center gap-2">
              Pending Deposits
              {deposits.length > 0 && (
                <span className="rounded-full bg-neon/20 px-2 py-0.5 text-xs text-neon">
                  {deposits.length}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {deposits.map((d) => (
                <DepositCard
                  key={d.id}
                  deposit={d}
                  processing={processing}
                  onApprove={(id) => approve("deposit", id, "approve")}
                  onReject={(id) => approve("transaction", id, "reject")}
                />
              ))}
              {deposits.length === 0 && (
                <p className="py-8 text-center text-sm text-on-surface-variant">No pending deposits</p>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Withdrawals */}
        <div>
          <GlassCard>
            <h3 className="mb-4 font-bold text-white flex items-center gap-2">
              Pending Withdrawals
              {withdrawals.length > 0 && (
                <span className="rounded-full bg-orange-400/20 px-2 py-0.5 text-xs text-orange-400">
                  {withdrawals.length}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {withdrawals.map((w) => {
                const isProcessing = processing === w.id;
                return (
                  <div key={w.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-white">{formatCurrency(w.amount)}</p>
                        <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                          {new Date(w.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          onClick={() => approve("withdrawal", w.id, "approve")}
                          disabled={isProcessing}
                          className="gap-1"
                        >
                          {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => approve("withdrawal", w.id, "reject")}
                          disabled={isProcessing}
                          className="gap-1 text-red-400 hover:text-red-300"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <p className="mb-0.5 text-[10px] text-on-surface-variant">Destination Wallet</p>
                      <p className="break-all font-mono text-[10px] text-orange-300">{w.wallet_address}</p>
                    </div>
                  </div>
                );
              })}
              {withdrawals.length === 0 && (
                <p className="py-8 text-center text-sm text-on-surface-variant">No pending withdrawals</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["users"]["Row"];

export function AdminUserDetail({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investments, setInvestments] = useState<Record<string, unknown>[]>([]);
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [withdrawals, setWithdrawals] = useState<Record<string, unknown>[]>([]);
  const [tab, setTab] = useState<"profile" | "investments" | "transactions" | "wallet">("profile");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/users/${userId}`);
    if (res.ok) {
      const json = await res.json();
      setProfile(json.profile);
      setInvestments(json.investments ?? []);
      setTransactions(json.transactions ?? []);
      setWithdrawals(json.withdrawals ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function suspend() {
    if (!profile || !confirm(profile.is_suspended ? "Unsuspend this user?" : "Suspend this user?"))
      return;
    setActionLoading(true);
    await fetch(`/api/admin/users/${userId}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspend: !profile.is_suspended }),
    });
    await load();
    setActionLoading(false);
  }

  async function softDelete() {
    if (!confirm("Soft delete this user? They will be banned and hidden from lists.")) return;
    setActionLoading(true);
    await fetch(`/api/admin/users/${userId}/delete`, { method: "POST" });
    window.location.href = "/admin/users";
  }

  async function updateKyc(status: string) {
    setActionLoading(true);
    await fetch(`/api/admin/users/${userId}/kyc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-white">User not found</p>;
  }

  const tabs = [
    { id: "profile" as const, label: "Profile" },
    { id: "investments" as const, label: "Investments" },
    { id: "transactions" as const, label: "Transactions" },
    { id: "wallet" as const, label: "Wallet" },
  ];

  return (
    <div className="mx-auto max-w-[1200px]">
      <FadeIn className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to users
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white">{profile.full_name ?? profile.email}</h1>
        <p className="font-mono text-sm text-on-surface-variant">{profile.id}</p>
      </FadeIn>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              tab === t.id ? "bg-neon/20 text-neon" : "bg-white/5 text-on-surface-variant hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <h3 className="mb-4 font-bold text-white">Profile Details</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Email" value={profile.email} />
              <Row label="Full name" value={profile.full_name ?? "—"} />
              <Row label="User ID" value={profile.id} mono />
              <Row label="Registered" value={new Date(profile.created_at).toLocaleString()} />
              <Row label="KYC status" value={profile.kyc_status ?? "pending"} />
              <Row label="Wallet balance" value={formatCurrency(Number(profile.wallet_balance))} neon />
              <Row
                label="Account status"
                value={
                  profile.deleted_at
                    ? "Deleted"
                    : profile.is_suspended
                      ? "Suspended"
                      : "Active"
                }
              />
            </dl>
            <p className="mt-4 text-xs text-on-surface-variant">
              Passwords are managed securely by Supabase Auth and are never shown here.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="mb-4 font-bold text-white">Admin Actions</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={() => updateKyc("approved")}
              >
                Approve KYC
              </Button>
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={() => updateKyc("rejected")}
              >
                Reject KYC
              </Button>
              <Button variant="outline" disabled={actionLoading} onClick={suspend}>
                {profile.is_suspended ? "Unsuspend User" : "Suspend User"}
              </Button>
              <Button variant="ghost" disabled={actionLoading} onClick={softDelete}>
                Soft Delete User
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "investments" && (
        <GlassCard>
          <h3 className="mb-4 font-bold text-white">Investment History</h3>
          <div className="space-y-3">
            {investments.map((inv) => {
              const plan = inv.investment_plans as { plan_name?: string } | null;
              return (
                <div
                  key={String(inv.id)}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <p className="font-bold text-white">{plan?.plan_name ?? "Plan"}</p>
                  <p className="text-sm text-on-surface-variant">
                    {formatCurrency(Number(inv.amount))} · {String(inv.status)} · ROI profit{" "}
                    {formatCurrency(Number(inv.expected_profit))}
                  </p>
                </div>
              );
            })}
            {!investments.length && (
              <p className="text-on-surface-variant">No investments</p>
            )}
          </div>
        </GlassCard>
      )}

      {tab === "transactions" && (
        <GlassCard>
          <h3 className="mb-4 font-bold text-white">Transactions</h3>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={String(tx.id)}
                className="flex justify-between rounded-xl border border-white/10 p-3 text-sm"
              >
                <span className="capitalize text-white">{String(tx.transaction_type)}</span>
                <span className="font-mono text-neon">{formatCurrency(Number(tx.amount))}</span>
                <span className="text-on-surface-variant">{String(tx.status)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === "wallet" && (
        <GlassCard>
          <h3 className="mb-4 font-bold text-white">Wallet & Withdrawals</h3>
          <p className="mb-4 text-3xl font-bold text-neon">
            {formatCurrency(Number(profile.wallet_balance))}
          </p>
          <h4 className="mb-2 text-sm font-medium text-on-surface-variant">Withdrawal requests</h4>
          {withdrawals.map((w) => (
            <div
              key={String(w.id)}
              className="mb-2 flex justify-between rounded-xl border border-white/10 p-3 text-sm"
            >
              <span className="text-white">{formatCurrency(Number(w.amount))}</span>
              <span>{String(w.status)}</span>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  neon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  neon?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd
        className={`text-right ${mono ? "font-mono text-xs" : ""} ${neon ? "text-neon font-bold" : "text-white"}`}
      >
        {value}
      </dd>
    </div>
  );
}

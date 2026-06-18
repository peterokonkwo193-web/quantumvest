"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  Mail,
  Search,
  Send,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

type PendingDeposit = {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  user_full_name: string | null;
  user_email: string | null;
  user_wallet_balance: number;
  user_joined: string | null;
  crypto_type: string | null;
  network: string | null;
  tx_hash: string | null;
  plan_name: string | null;
};

type UserOption = {
  id: string;
  full_name: string | null;
  email: string;
  wallet_balance: number;
};

const CRYPTO_COLORS: Record<string, string> = {
  BTC: "text-[#F7931A] border-[#F7931A44] bg-[#F7931A11]",
  USDT: "text-[#26A17B] border-[#26A17B44] bg-[#26A17B11]",
  ETH: "text-[#627EEA] border-[#627EEA44] bg-[#627EEA11]",
};

export function AdminClients() {
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Profit form
  const [userSearch, setUserSearch] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [profitForm, setProfitForm] = useState({ user_id: "", user_label: "", amount: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadDeposits = useCallback(async () => {
    const res = await fetch("/api/admin/pending-deposits");
    if (res.ok) {
      const d = await res.json();
      setDeposits(d.deposits ?? []);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users?limit=500");
    if (res.ok) {
      const j = await res.json();
      setUsers(j.users ?? []);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadDeposits(), loadUsers()]);
    setLoading(false);
  }, [loadDeposits, loadUsers]);

  useEffect(() => {
    loadAll();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-clients-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, loadAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, loadUsers)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAll, loadUsers]);

  async function handleDeposit(id: string, action: "approve" | "reject") {
    setProcessing(id);
    await fetch("/api/admin/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "deposit", id, action }),
    });
    await loadAll();
    setProcessing(null);
  }

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (u.full_name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  function selectUser(u: UserOption) {
    setProfitForm((f) => ({
      ...f,
      user_id: u.id,
      user_label: u.full_name ? `${u.full_name} (${u.email})` : u.email,
    }));
    setShowUserList(false);
    setUserSearch("");
  }

  async function sendProfit(e: React.FormEvent) {
    e.preventDefault();
    if (!profitForm.user_id || !profitForm.amount) return;
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");
    const res = await fetch("/api/admin/profits/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: profitForm.user_id,
        amount: parseFloat(profitForm.amount),
        profit_type: "manual",
        description: profitForm.description || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(data.error ?? "Failed to send profit");
    } else {
      setSuccessMsg(`${formatCurrency(parseFloat(profitForm.amount))} credited to ${data.user_name ?? "client"}. New balance: ${formatCurrency(data.new_balance)}`);
      setProfitForm({ user_id: "", user_label: "", amount: "", description: "" });
      await loadUsers();
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-10">
      <FadeIn>
        <span className="label-mono text-neon">Client Management</span>
        <h1 className="text-3xl font-bold text-white">Clients</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Review pending deposit requests and send profits to your clients.
        </p>
      </FadeIn>

      {/* ── SECTION 1: Pending Deposits ── */}
      <FadeIn>
        <GlassCard>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Pending Payment Requests
                {deposits.length > 0 && (
                  <span className="rounded-full bg-neon/20 px-2.5 py-0.5 text-xs font-bold text-neon">
                    {deposits.length}
                  </span>
                )}
              </h2>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Clients who confirmed payment and are waiting for you to accept or decline
              </p>
            </div>
          </div>

          {deposits.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-neon/40" />
              <p className="font-bold text-white">All clear</p>
              <p className="mt-1 text-sm text-on-surface-variant">No pending payment requests right now.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="pb-3 pr-4">Client</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Signed Up</th>
                    <th className="pb-3 pr-4">Investment Plan</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Via</th>
                    <th className="pb-3 pr-4">TX Hash</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deposits.map((d) => {
                    const isProcessing = processing === d.id;
                    const name = d.user_full_name ?? d.user_email ?? "Unknown";
                    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                    const cryptoCls = CRYPTO_COLORS[d.crypto_type ?? ""] ?? "text-white border-white/20 bg-white/5";
                    return (
                      <tr key={d.id} className="group">
                        {/* Name */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neon/20 bg-neon/10 text-xs font-bold text-neon">
                              {initials}
                            </div>
                            <span className="font-bold text-white whitespace-nowrap">{name}</span>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="py-4 pr-4">
                          <span className="text-on-surface-variant">{d.user_email ?? "—"}</span>
                        </td>
                        {/* Signup date */}
                        <td className="py-4 pr-4 whitespace-nowrap">
                          <span className="text-on-surface-variant text-xs">
                            {d.user_joined ? new Date(d.user_joined).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        {/* Plan */}
                        <td className="py-4 pr-4">
                          {d.plan_name ? (
                            <span className="rounded-full border border-neon/30 bg-neon/10 px-2.5 py-1 text-[11px] font-bold text-neon whitespace-nowrap">
                              {d.plan_name}
                            </span>
                          ) : (
                            <span className="text-on-surface-variant/50 text-xs italic">Not specified</span>
                          )}
                        </td>
                        {/* Amount */}
                        <td className="py-4 pr-4">
                          <span className="font-extrabold text-neon text-base whitespace-nowrap">
                            {formatCurrency(d.amount)}
                          </span>
                        </td>
                        {/* Crypto */}
                        <td className="py-4 pr-4">
                          {d.crypto_type ? (
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${cryptoCls}`}>
                              {d.crypto_type}{d.network ? ` · ${d.network}` : ""}
                            </span>
                          ) : <span className="text-on-surface-variant/50">—</span>}
                        </td>
                        {/* TX Hash */}
                        <td className="py-4 pr-4 max-w-[140px]">
                          {d.tx_hash ? (
                            <span className="block truncate font-mono text-[10px] text-neon/80" title={d.tx_hash}>
                              {d.tx_hash}
                            </span>
                          ) : (
                            <span className="text-[10px] italic text-on-surface-variant/50">None provided</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleDeposit(d.id, "approve")}
                              disabled={isProcessing}
                              className="gap-1.5 bg-neon text-black hover:bg-neon/90"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeposit(d.id, "reject")}
                              disabled={isProcessing}
                              className="gap-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                              <XCircle className="h-3 w-3" />
                              Decline
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </FadeIn>

      {/* ── SECTION 2: All Clients ── */}
      <FadeIn>
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon/20 bg-neon/10">
              <User className="h-5 w-5 text-neon" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                All Clients
                <span className="rounded-full bg-neon/20 px-2.5 py-0.5 text-xs font-bold text-neon">
                  {users.length}
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant">Every registered investor on the platform</p>
            </div>
          </div>

          {users.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No clients yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Joined</th>
                    <th className="pb-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => {
                    const initials = (u.full_name ?? u.email).split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={u.id} className="group">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neon/20 bg-neon/10 text-xs font-bold text-neon">
                              {initials}
                            </div>
                            <span className="font-bold text-white whitespace-nowrap">{u.full_name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-on-surface-variant">{u.email}</span>
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <span className="text-xs text-on-surface-variant">
                            {new Date((u as unknown as {created_at: string}).created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="font-bold text-neon">{formatCurrency(u.wallet_balance)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </FadeIn>

      {/* ── SECTION 3: Send Profit ── */}
      <FadeIn>
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon/20 bg-neon/10">
              <Send className="h-5 w-5 text-neon" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Send Profit to Client</h2>
              <p className="text-xs text-on-surface-variant">
                Select a client, enter the amount, and it will be credited to their wallet instantly.
              </p>
            </div>
          </div>

          <form onSubmit={sendProfit} className="grid gap-6 md:grid-cols-2">
            {/* Client picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Client
              </Label>
              <div className="relative">
                <div
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm"
                  onClick={() => setShowUserList((v) => !v)}
                >
                  {profitForm.user_label ? (
                    <span className="text-white">{profitForm.user_label}</span>
                  ) : (
                    <span className="text-on-surface-variant">Search by name or email…</span>
                  )}
                  {showUserList ? (
                    <ChevronUp className="h-4 w-4 text-on-surface-variant" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                  )}
                </div>
                {showUserList && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-[#0d0d0d] shadow-xl">
                    <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                      <Search className="h-4 w-4 shrink-0 text-on-surface-variant" />
                      <input
                        autoFocus
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search client…"
                        className="w-full bg-transparent text-sm text-white placeholder:text-on-surface-variant focus:outline-none"
                      />
                    </div>
                    <div className="max-h-52 overflow-auto">
                      {filteredUsers.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-on-surface-variant">No clients found</p>
                      ) : (
                        filteredUsers.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => selectUser(u)}
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-white/5"
                          >
                            <div>
                              <p className="font-bold text-white">{u.full_name ?? u.email}</p>
                              {u.full_name && <p className="text-xs text-on-surface-variant">{u.email}</p>}
                            </div>
                            <span className="text-xs text-neon">{formatCurrency(u.wallet_balance)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Selected user wallet balance */}
              {profitForm.user_id && (() => {
                const u = users.find((x) => x.id === profitForm.user_id);
                return u ? (
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Current balance: <span className="text-neon font-bold">{formatCurrency(u.wallet_balance)}</span>
                  </p>
                ) : null;
              })()}
            </div>

            {/* Amount + description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Profit Amount (USD)
                </Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={profitForm.amount}
                  onChange={(e) => setProfitForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Note to Client <span className="text-on-surface-variant/60">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g. Gold Plan ROI payout — Week 3"
                  value={profitForm.description}
                  onChange={(e) => setProfitForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Feedback + Submit — full width */}
            <div className="md:col-span-2 space-y-4">
              {successMsg && (
                <div className="flex items-start gap-2 rounded-xl border border-neon/30 bg-neon/10 px-4 py-3 text-sm text-neon">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={submitting || !profitForm.user_id || !profitForm.amount}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? "Sending…" : "Send Profit to Client"}
              </Button>
            </div>
          </form>
        </GlassCard>
      </FadeIn>
    </div>
  );
}

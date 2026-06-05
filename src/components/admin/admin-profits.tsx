"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

type UserOption = { id: string; full_name: string | null; email: string; wallet_balance: number };

type ProfitRow = {
  id: string;
  user_id: string;
  amount: number;
  profit_type: string;
  status: string;
  description: string | null;
  created_at: string;
  user_full_name: string | null;
  user_email: string | null;
};

const PROFIT_TYPES = [
  { value: "manual", label: "Manual Profit" },
  { value: "roi", label: "ROI Return" },
  { value: "bonus", label: "Bonus Reward" },
  { value: "referral", label: "Referral Commission" },
];

const STATUS_STYLE: Record<string, string> = {
  paid: "text-neon bg-neon/10 border-neon/20",
  approved: "text-neon bg-neon/10 border-neon/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  scheduled: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

export function AdminProfits() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [profits, setProfits] = useState<ProfitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyExpanded, setHistoryExpanded] = useState(true);

  const [form, setForm] = useState({
    user_id: "",
    user_label: "",
    amount: "",
    profit_type: "manual",
    description: "",
  });

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users?limit=200");
    if (res.ok) {
      const j = await res.json();
      setUsers(j.users ?? []);
    }
  }, []);

  const loadProfits = useCallback(async () => {
    const res = await fetch("/api/admin/profits/history");
    if (res.ok) {
      const j = await res.json();
      setProfits(j.profits ?? []);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadUsers(), loadProfits()]);
    setLoading(false);
  }, [loadUsers, loadProfits]);

  useEffect(() => {
    loadAll();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-profits-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "profits" }, loadProfits)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAll, loadProfits]);

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  function selectUser(u: UserOption) {
    setForm((f) => ({
      ...f,
      user_id: u.id,
      user_label: u.full_name ? `${u.full_name} (${u.email})` : u.email,
    }));
    setShowUserList(false);
    setUserSearch("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.user_id || !form.amount) return;

    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const res = await fetch("/api/admin/profits/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: form.user_id,
        amount: parseFloat(form.amount),
        profit_type: form.profit_type,
        description: form.description || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error ?? "Failed to send profit");
    } else {
      setSuccessMsg(
        `${formatCurrency(parseFloat(form.amount))} credited to ${data.user_name ?? "client"}. New balance: ${formatCurrency(data.new_balance)}`
      );
      setForm({ user_id: "", user_label: "", amount: "", profit_type: "manual", description: "" });
      await loadProfits();
      // Refresh user list to get updated balances
      await loadUsers();
    }

    setSubmitting(false);
  }

  const filteredProfits = profits.filter((p) => {
    if (!historySearch) return true;
    const q = historySearch.toLowerCase();
    return (
      (p.user_full_name ?? "").toLowerCase().includes(q) ||
      (p.user_email ?? "").toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q)
    );
  });

  const selectedUser = users.find((u) => u.id === form.user_id);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <FadeIn className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="label-mono text-neon">Profit Management</span>
          <h1 className="text-3xl font-bold text-white">Send Profits to Clients</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Credit any amount directly to a client&apos;s wallet. It reflects instantly on their dashboard.
          </p>
        </div>
        <Button variant="outline" onClick={loadProfits} className="gap-2 self-start md:self-auto">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </FadeIn>

      <div className="grid gap-8 xl:grid-cols-2">
        {/* ── Send Profit Form ── */}
        <GlassCard className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon/20 bg-neon/10">
              <Send className="h-5 w-5 text-neon" />
            </div>
            <div>
              <h3 className="font-bold text-white">Send Profit</h3>
              <p className="text-xs text-on-surface-variant">Instantly credited to client wallet</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Client selector */}
            <div className="space-y-2">
              <Label>Select Client</Label>
              <div className="relative">
                <div
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm"
                  onClick={() => setShowUserList((v) => !v)}
                >
                  {form.user_label ? (
                    <span className="text-white">{form.user_label}</span>
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
                    <div className="max-h-52 overflow-auto custom-scrollbar">
                      {filteredUsers.length === 0 && (
                        <p className="px-4 py-3 text-sm text-on-surface-variant">No clients found</p>
                      )}
                      {filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => selectUser(u)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-white/5"
                        >
                          <div>
                            <p className="font-bold text-white">{u.full_name ?? u.email}</p>
                            {u.full_name && (
                              <p className="text-xs text-on-surface-variant">{u.email}</p>
                            )}
                          </div>
                          <span className="text-xs text-neon">{formatCurrency(u.wallet_balance)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected client details */}
              {selectedUser && (
                <div className="rounded-xl border border-neon/10 bg-neon/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{selectedUser.full_name ?? selectedUser.email}</p>
                      {selectedUser.full_name && (
                        <p className="text-xs text-on-surface-variant">{selectedUser.email}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant">Current Balance</p>
                      <p className="font-bold text-neon">{formatCurrency(selectedUser.wallet_balance)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Profit Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="pl-9"
                />
              </div>
              {form.amount && selectedUser && (
                <p className="text-xs text-on-surface-variant">
                  New balance after credit:{" "}
                  <span className="font-bold text-neon">
                    {formatCurrency(selectedUser.wallet_balance + parseFloat(form.amount || "0"))}
                  </span>
                </p>
              )}
            </div>

            {/* Profit type */}
            <div className="space-y-2">
              <Label>Profit Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {PROFIT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, profit_type: t.value })}
                    className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${
                      form.profit_type === t.value
                        ? "border-neon bg-neon/10 text-neon"
                        : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>
                Note to Client{" "}
                <span className="text-on-surface-variant font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="e.g. Week 2 ROI payout, Gold Plan bonus…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl border border-neon/20 bg-neon/5 px-4 py-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
                  <p className="text-sm text-neon">{successMsg}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !form.user_id || !form.amount}
              className="w-full gap-2"
              size="lg"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? "Sending…" : "Send Profit Now"}
            </Button>

            <p className="text-center text-xs text-on-surface-variant">
              Profit is credited immediately. Client&apos;s dashboard updates in real time.
            </p>
          </form>
        </GlassCard>

        {/* ── Profit History ── */}
        <div>
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setHistoryExpanded((v) => !v)}
                className="flex items-center gap-2 font-bold text-white hover:text-neon"
              >
                Profit History
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {profits.length}
                </span>
                {historyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search client…"
                  className="rounded-lg border border-white/10 bg-black/50 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-on-surface-variant focus:border-neon focus:outline-none w-40"
                />
              </div>
            </div>

            {historyExpanded && (
              <div className="max-h-[560px] overflow-auto custom-scrollbar space-y-2 pr-1">
                {filteredProfits.length === 0 && (
                  <p className="py-8 text-center text-sm text-on-surface-variant">
                    No profit records yet
                  </p>
                )}
                {filteredProfits.map((p) => {
                  const displayName = p.user_full_name ?? p.user_email ?? p.user_id.slice(0, 8);
                  const initials = displayName
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const statusCls = STATUS_STYLE[p.status] ?? "text-white/60 border-white/10 bg-white/5";
                  const typeLabel = PROFIT_TYPES.find((t) => t.value === p.profit_type)?.label ?? p.profit_type;

                  return (
                    <div
                      key={p.id}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neon/20 bg-neon/10 text-xs font-bold text-neon">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <p className="font-bold text-white text-sm">{displayName}</p>
                          <p className="font-mono font-bold text-neon">{formatCurrency(p.amount)}</p>
                        </div>
                        {p.user_full_name && (
                          <p className="text-[10px] text-on-surface-variant">{p.user_email}</p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusCls}`}>
                            {p.status}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">{typeLabel}</span>
                          {p.description && (
                            <span className="text-[10px] text-on-surface-variant italic">&quot;{p.description}&quot;</span>
                          )}
                        </div>
                        <p className="mt-1 text-[10px] text-on-surface-variant/50">
                          {new Date(p.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

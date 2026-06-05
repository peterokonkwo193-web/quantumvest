"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [suspendedFilter, setSuspendedFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (kycFilter) params.set("kyc_status", kycFilter);
    if (suspendedFilter) params.set("suspended", suspendedFilter);

    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const json = await res.json();
      setUsers(json.users ?? []);
    }
    setLoading(false);
  }, [search, kycFilter, suspendedFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <FadeIn className="mb-8">
        <span className="label-mono text-neon">User Management</span>
        <h1 className="text-3xl font-bold text-white">Registered Users</h1>
        <p className="mt-2 text-on-surface-variant">
          View and manage investors. Passwords are never stored or displayed.
        </p>
      </FadeIn>

      <GlassCard className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, or user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm text-white"
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
          >
            <option value="">All KYC</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-sm text-white"
            value={suspendedFilter}
            onChange={(e) => setSuspendedFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Suspended</option>
          </select>
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-neon" />
        </div>
      ) : (
        <GlassCard className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-on-surface-variant">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">User ID</th>
                <th className="pb-3 pr-4">Registered</th>
                <th className="pb-3 pr-4">KYC</th>
                <th className="pb-3 pr-4">Wallet</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 pr-4 font-medium text-white">{u.full_name ?? "—"}</td>
                  <td className="py-4 pr-4 text-on-surface-variant">{u.email}</td>
                  <td className="py-4 pr-4">
                    <button
                      type="button"
                      onClick={() => copyId(u.id)}
                      className="font-mono text-xs text-neon hover:underline"
                      title="Copy full ID"
                    >
                      {u.id.slice(0, 8)}…
                    </button>
                  </td>
                  <td className="py-4 pr-4 text-on-surface-variant">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 pr-4">
                    <KycBadge status={u.kyc_status ?? "pending"} />
                  </td>
                  <td className="py-4 pr-4 font-mono text-neon">
                    {formatCurrency(Number(u.wallet_balance))}
                  </td>
                  <td className="py-4">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/users/${u.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && (
            <p className="py-12 text-center text-on-surface-variant">No users found</p>
          )}
        </GlassCard>
      )}
    </div>
  );
}

function KycBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-neon/20 text-neon",
    rejected: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? colors.pending}`}
    >
      {status}
    </span>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Coins,
  LayoutDashboard,
  Menu,
  Receipt,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/clients", label: "Clients", icon: Users, badge: true },
  { href: "/admin/profits", label: "Profit Management", icon: Coins },
  { href: "/admin/plans", label: "Plans", icon: TrendingUp },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pending-deposits");
      if (res.ok) {
        const data = await res.json();
        const depositCount = data.total ?? 0;

        const supabase = createClient();
        const { count } = await supabase
          .from("withdrawals")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        setPendingCount(depositCount + (count ?? 0));
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchPending();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-shell-pending")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, fetchPending)
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, fetchPending)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPending]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const NavContent = () => (
    <>
      <div className="mb-8 px-2">
        <span className="label-mono text-neon text-xs">QuantumVest</span>
        <h2 className="text-lg font-bold text-white">Admin Console</h2>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-neon/10 text-neon shadow-[0_0_20px_rgba(198,255,0,0.15)]"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neon text-[10px] font-extrabold text-black px-1">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">Investor View</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(198,255,0,0.06)_0%,_transparent_50%)]" />
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg border border-white/10 bg-black/80 p-2 text-neon lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-black/90 p-6 backdrop-blur-xl transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <NavContent />
      </aside>

      <main className="lg:pl-64">
        <div className="section-padding">{children}</div>
      </main>
    </div>
  );
}

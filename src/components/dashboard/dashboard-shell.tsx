"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Signal,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/plans", label: "Investment Plans", icon: TrendingUp },
  { href: "/dashboard/trading", label: "Trading History", icon: LineChart },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; is_read: boolean }[]>([]);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, is_read")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("shell-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, fetchNotifications)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications, supabase]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const NavContent = () => (
    <>
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2 mb-1">
          <Signal className="h-5 w-5 text-neon" fill="#C6FF00" />
          <span className="font-extrabold tracking-tighter text-neon">QUANTUMVEST</span>
        </div>
        <p className="text-xs text-on-surface-variant label-mono">Investor Portal</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-neon/10 text-neon shadow-[0_0_20px_rgba(198,255,0,0.1)]"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-on-surface-variant transition-all hover:bg-white/5 hover:text-white"
          >
            <Bell className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Notifications</span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neon px-1 text-[10px] font-extrabold text-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl">
              <p className="label-mono mb-3 text-xs text-on-surface-variant">Notifications</p>
              <div className="max-h-64 space-y-2 overflow-y-auto text-sm">
                {notifications.length === 0 ? (
                  <p className="text-on-surface-variant">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-lg border p-3 ${n.is_read ? "border-white/10" : "border-neon/20 bg-neon/5"}`}
                    >
                      <p className="font-bold text-white">{n.title}</p>
                      <p className="text-xs text-on-surface-variant">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-on-surface-variant transition-all hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(198,255,0,0.05)_0%,_transparent_50%)]" />

      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/80 text-neon lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-black/95 p-6 backdrop-blur-xl transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <NavContent />
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:pl-64">
        {children}
      </main>
    </div>
  );
}

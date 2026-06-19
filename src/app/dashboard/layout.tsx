import { DashboardShell } from "@/components/dashboard/dashboard-shell";

// All dashboard pages are auth-protected and user-specific — never prerender
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

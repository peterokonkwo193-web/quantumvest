import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your investor dashboard — portfolio, analytics, deposits, and withdrawals.",
};

export default function Page() {
  return <DashboardPage />;
}

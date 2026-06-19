import type { Metadata } from "next";
import { DashboardPlansPage } from "@/components/dashboard/dashboard-plans-page";

export const metadata: Metadata = {
  title: "Investment Plans | QuantumVest",
};

export default function Page() {
  return <DashboardPlansPage />;
}

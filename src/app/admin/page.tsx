import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata: Metadata = {
  title: "Admin Overview | QuantumVest",
  description: "Platform command center.",
};

export default function Page() {
  return <AdminOverview />;
}

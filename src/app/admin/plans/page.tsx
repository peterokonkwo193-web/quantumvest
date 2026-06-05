import type { Metadata } from "next";
import { AdminPlans } from "@/components/admin/admin-plans";

export const metadata: Metadata = {
  title: "Plan Management | Admin",
};

export default function Page() {
  return <AdminPlans />;
}

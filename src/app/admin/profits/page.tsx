import type { Metadata } from "next";
import { AdminProfits } from "@/components/admin/admin-profits";

export const metadata: Metadata = {
  title: "Profit Management | Admin",
};

export default function Page() {
  return <AdminProfits />;
}

import type { Metadata } from "next";
import { AdminTransactions } from "@/components/admin/admin-transactions";

export const metadata: Metadata = {
  title: "Transactions | Admin",
};

export default function Page() {
  return <AdminTransactions />;
}

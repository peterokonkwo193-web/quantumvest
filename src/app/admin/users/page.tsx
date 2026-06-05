import type { Metadata } from "next";
import { AdminUsers } from "@/components/admin/admin-users";

export const metadata: Metadata = {
  title: "User Management | Admin",
};

export default function Page() {
  return <AdminUsers />;
}

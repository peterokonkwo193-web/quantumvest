import type { Metadata } from "next";
import { AdminUserDetail } from "@/components/admin/admin-user-detail";

export const metadata: Metadata = {
  title: "User Details | Admin",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminUserDetail userId={id} />;
}

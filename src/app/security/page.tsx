import type { Metadata } from "next";
import { SecurityPage } from "@/components/pages/security-page";

export const metadata: Metadata = {
  title: "Security",
  description: "Institutional-grade security infrastructure protecting your crypto investments.",
};

export default function Page() {
  return <SecurityPage />;
}

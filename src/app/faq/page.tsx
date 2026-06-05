import type { Metadata } from "next";
import { FAQPage } from "@/components/pages/faq-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about QuantumVest investment platform.",
};

export default function Page() {
  return <FAQPage />;
}

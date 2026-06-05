import type { Metadata } from "next";
import { BlogPage } from "@/components/pages/blog-page";

export const metadata: Metadata = {
  title: "Investment Insights",
  description: "Guides, strategies, and insights to help you invest smarter with QuantumVest.",
};

export default function Page() {
  return <BlogPage />;
}

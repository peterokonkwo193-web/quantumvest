import type { Metadata } from "next";
import { PlansPage } from "@/components/pages/plans-page";

export const metadata: Metadata = {
  title: "Investment Plans",
  description: "Choose from five premium investment tiers with fixed ROI and institutional-grade security.",
};

export default function Page() {
  return <PlansPage />;
}

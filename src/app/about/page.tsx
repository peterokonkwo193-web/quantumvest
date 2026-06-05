import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/about-page";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind QuantumVest — building the future of decentralized finance.",
};

export default function Page() {
  return <AboutPage />;
}

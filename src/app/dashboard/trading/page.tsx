import type { Metadata } from "next";
import { TradingPage } from "@/components/dashboard/trading-page";

export const metadata: Metadata = {
  title: "Trading History | QuantumVest",
};

export default function Page() {
  return <TradingPage />;
}

import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/services-page";

export const metadata: Metadata = {
  title: "Services",
  description: "Institutional-grade crypto investment services and wealth management solutions.",
};

export default function Page() {
  return <ServicesPage />;
}

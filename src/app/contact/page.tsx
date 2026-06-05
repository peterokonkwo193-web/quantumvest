import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the QuantumVest team.",
};

export default function Page() {
  return <ContactPage />;
}

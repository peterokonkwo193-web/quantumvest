import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Login",
  description: "Secure access to your QuantumVest investor terminal.",
};

export default function Page() {
  return <LoginPage />;
}

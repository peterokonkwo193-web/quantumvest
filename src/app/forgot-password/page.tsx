import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your QuantumVest account password.",
};

export default function Page() {
  return <ForgotPasswordPage />;
}

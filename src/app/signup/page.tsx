import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupPage } from "@/components/auth/signup-page";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your QuantumVest investor account.",
};

export default function Page() {
  return (
    <Suspense>
      <SignupPage />
    </Suspense>
  );
}

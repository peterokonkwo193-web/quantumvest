"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Signal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonParticles } from "@/components/animations/motion-components";
import { createClient } from "@/lib/supabase";

const steps = ["Account", "Verify", "Complete"];

export function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 8) return setError("Password must be at least 8 characters");

    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Registration failed");
      setLoading(false);
      return;
    }

    setStep(1);
    setLoading(false);
  }

  async function handleComplete() {
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(selectedPlan ? "/plans" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen">
      <NeonParticles />
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-background/80 px-6 py-4 backdrop-blur-xl md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Signal className="h-5 w-5 text-neon" fill="#C6FF00" />
          <span className="font-extrabold tracking-tighter text-neon">QUANTUMVEST</span>
        </Link>
        <Link href="/login" className="label-mono text-on-surface-variant hover:text-neon">Sign In</Link>
      </header>

      <main className="flex min-h-screen items-center justify-center px-6 py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-[560px] rounded-[32px] p-10"
        >
          <div className="mb-8 flex justify-between">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`label-mono text-xs ${i <= step ? "text-neon" : "text-on-surface-variant"} ${i === step ? "border-b-2 border-neon pb-1" : ""}`}
              >
                {s}
              </div>
            ))}
          </div>

          {selectedPlan && step === 0 && (
            <div className="mb-6 rounded-xl border border-neon/30 bg-neon/5 p-4">
              <p className="label-mono text-neon">Selected Plan: {selectedPlan.toUpperCase()}</p>
            </div>
          )}

          {step === 0 && (
            <>
              <h1 className="mb-2 text-2xl font-bold text-white">Create Account</h1>
              <p className="mb-8 text-on-surface-variant">Initialize your investor profile</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Continue"}
                </Button>
              </form>
            </>
          )}

          {step === 1 && (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-neon" />
              <h2 className="text-xl font-bold text-white">Verify Your Email</h2>
              <p className="mt-2 text-on-surface-variant">
                A verification email was sent to {email}. After verifying, continue.
              </p>
              <Button className="mt-8" onClick={() => setStep(2)}>I&apos;ve Verified — Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-neon" />
              <h2 className="text-xl font-bold text-white">Account Ready</h2>
              <p className="mt-2 text-on-surface-variant">
                Your account is live. KYC review takes up to 24 hours.
              </p>
              <Button className="mt-8" onClick={handleComplete} disabled={loading}>
                {loading ? "Loading..." : "Enter Dashboard"}
              </Button>
            </div>
          )}

          {step === 0 && (
            <p className="mt-6 text-center text-sm text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/login" className="text-neon hover:underline">Sign in</Link>
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}

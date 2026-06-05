"use client";

import { useState } from "react";
import Link from "next/link";
import { Signal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonParticles } from "@/components/animations/motion-components";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const payload = await res.json();
    setLoading(false);
    setStatus(res.ok ? "Reset link sent. Check your inbox." : payload.error || "Unable to send reset email.");
  }

  return (
    <div className="relative min-h-screen">
      <NeonParticles />
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-background/80 px-6 py-4 backdrop-blur-xl md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Signal className="h-5 w-5 text-neon" fill="#C6FF00" />
          <span className="font-extrabold tracking-tighter text-neon">QUANTUMVEST</span>
        </Link>
        <Link href="/login" className="label-mono text-on-surface-variant hover:text-neon">Back to Login</Link>
      </header>

      <main className="flex min-h-screen items-center justify-center px-6 pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-[480px] rounded-[32px] p-10">
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="mt-2 text-on-surface-variant">Enter your account email and we will send a reset link.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
          </form>

          {status && <p className="mt-4 text-sm text-neon">{status}</p>}
        </motion.div>
      </main>
    </div>
  );
}

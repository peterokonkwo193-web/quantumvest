"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Signal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonParticles } from "@/components/animations/motion-components";
import { createClient } from "@/lib/supabase";

export function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(data.user?.app_metadata?.role === "admin" ? "/admin" : "/dashboard");
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
        <Link href="/" className="label-mono text-on-surface-variant hover:text-neon">
          Back to Site
        </Link>
      </header>

      <main className="flex min-h-screen items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card w-full max-w-[480px] rounded-[32px] p-10"
        >
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white">Terminal Access</h1>
            <p className="mt-2 text-on-surface-variant">Secure authentication for investor accounts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="investor@quantumvest.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-neon hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Authenticating..." : "Access Terminal"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            No account? <Link href="/signup" className="font-bold text-neon hover:underline">Initialize Account</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}

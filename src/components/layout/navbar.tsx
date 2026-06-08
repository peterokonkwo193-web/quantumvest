"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Signal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/plans", label: "Plans" },
  { href: "/services", label: "Services" },
  { href: "/security", label: "Security" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) return null;

  return (
    <header className="fixed top-9 z-50 w-full border-b border-white/10 bg-surface/60 backdrop-blur-xl shadow-[0_0_20px_rgba(198,255,0,0.1)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Signal className="h-6 w-6 text-neon" fill="#C6FF00" />
          <span className="text-xl font-extrabold tracking-tighter text-white">QUANTUMVEST</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "label-mono transition-colors hover:text-neon",
                pathname === link.href ? "font-bold text-neon" : "text-on-surface-variant"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-surface/95 px-4 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "label-mono py-2",
                  pathname === link.href ? "text-neon" : "text-on-surface-variant"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

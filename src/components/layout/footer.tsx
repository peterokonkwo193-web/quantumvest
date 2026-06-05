"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Signal } from "lucide-react";

const footerLinks = {
  Platform: [
    { href: "/plans", label: "Investment Plans" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/services", label: "Services" },
    { href: "/security", label: "Security" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
  ],
  Legal: [
    { href: "/security", label: "Privacy Policy" },
    { href: "/security", label: "Terms of Service" },
    { href: "/security", label: "Risk Disclosure" },
  ],
};

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <footer className="border-t border-white/10 bg-surface-container-lowest/50">
      <div className="mx-auto max-w-7xl section-padding">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Signal className="h-5 w-5 text-neon" fill="#C6FF00" />
              <span className="font-extrabold tracking-tighter text-white">QUANTUMVEST</span>
            </Link>
            <p className="text-sm text-on-surface-variant">
              A professional crypto investment platform offering fixed-return plans, real-time profit tracking, and institutional-grade security.
            </p>
            <p className="text-xs text-on-surface-variant/60">
              support@quantumvest.com
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="label-mono mb-4 text-neon">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-surface-variant transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="label-mono text-on-surface-variant">
            © {new Date().getFullYear()} QuantumVest. All rights reserved.
          </p>
          <p className="label-mono text-xs text-on-surface-variant/60">
            Crypto investments carry risk. Past returns do not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import {
  Eye,
  Fingerprint,
  Lock,
  Server,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";

const securityFeatures = [
  {
    icon: Shield,
    title: "Multi-Sig Custody",
    description: "3-of-5 multi-signature wallet architecture with geographically distributed key holders.",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description: "All data encrypted at rest and in transit using military-grade encryption standards.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Authentication",
    description: "Optional Face ID and fingerprint authentication for mobile terminal access.",
  },
  {
    icon: Server,
    title: "Cold Storage",
    description: "95% of assets held in air-gapped cold storage with institutional insurance coverage.",
  },
  {
    icon: Eye,
    title: "24/7 Monitoring",
    description: "Real-time threat detection with automated incident response and SOC team oversight.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Certified",
    description: "SOC 2 Type II, ISO 27001, and regular third-party security audits with zero critical findings.",
  },
];

const certifications = [
  "SOC 2 Type II",
  "ISO 27001",
  "PCI DSS Level 1",
  "GDPR Compliant",
  "CCSS Level III",
  "FinCEN Registered",
];

export function SecurityPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-20 text-center">
          <span className="label-mono text-neon">Security</span>
          <h1 className="mt-4 text-4xl font-extrabold text-white md:text-6xl">
            FORTRESS-GRADE <span className="text-neon neon-glow-text">PROTECTION</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-on-surface-variant">
            Your capital deserves the same security infrastructure trusted by the
            world&apos;s largest financial institutions.
          </p>
        </FadeIn>

        <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {securityFeatures.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.08}>
              <GlassCard>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10">
                  <feature.icon className="h-6 w-6 text-neon" />
                </div>
                <h3 className="mb-3 font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant">{feature.description}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <GlassCard glow className="p-12 text-center">
            <h2 className="mb-8 text-2xl font-bold text-white">Certifications & Compliance</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {certifications.map((cert) => (
                <span
                  key={cert}
                  className="rounded-pill border border-neon/30 bg-neon/5 px-6 py-2 label-mono text-neon"
                >
                  {cert}
                </span>
              ))}
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </div>
  );
}

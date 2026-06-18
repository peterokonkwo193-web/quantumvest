"use client";

import { useState } from "react";
import { CheckCircle, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contactInfo = [
  { icon: Mail, label: "Email", value: "support@quantumvest0.com" },
  { icon: Phone, label: "Support Hours", value: "Monday – Saturday, 9am – 9pm UTC" },
  { icon: MapPin, label: "Offices", value: "Singapore · London · Dubai" },
  { icon: MessageCircle, label: "Response Time", value: "Within 24 hours" },
];

export function ContactPage() {
  const [fields, setFields] = useState({
    firstName: "", lastName: "", email: "", subject: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send. Please try again.");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-16 text-center">
          <span className="label-mono text-neon">Contact Us</span>
          <h1 className="mt-4 text-4xl font-extrabold text-white md:text-5xl">
            We&apos;re Here to <span className="text-neon neon-glow-text">Help</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-on-surface-variant">
            Have a question about your account, a deposit, or our investment plans? Our team is ready to assist.
          </p>
        </FadeIn>

        <div className="grid gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <GlassCard key={item.label} className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neon/20 bg-neon/10">
                    <item.icon className="h-5 w-5 text-neon" />
                  </div>
                  <div>
                    <p className="label-mono text-xs text-on-surface-variant">{item.label}</p>
                    <p className="font-bold text-white">{item.value}</p>
                  </div>
                </GlassCard>
              ))}

              <div className="rounded-[24px] border border-neon/10 bg-neon/5 p-6">
                <p className="label-mono mb-2 text-neon">Investor Support</p>
                <p className="text-sm text-on-surface-variant">
                  For account issues, deposit confirmations, or withdrawal enquiries, please include your registered email and account details in your message for faster resolution.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <GlassCard className="p-8">
              {submitted ? (
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto mb-4 h-14 w-14 text-neon" />
                  <h2 className="text-xl font-bold text-white">Message Received</h2>
                  <p className="mt-3 text-on-surface-variant">
                    Thank you for reaching out. Our support team will respond to{" "}
                    <strong className="text-white">{fields.email}</strong> within 24 hours.
                  </p>
                  <Button className="mt-6" variant="outline" onClick={() => { setSubmitted(false); setFields({ firstName: "", lastName: "", email: "", subject: "", message: "" }); }}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-white">Send a Message</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={fields.firstName} onChange={set("firstName")} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={fields.lastName} onChange={set("lastName")} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={fields.email} onChange={set("email")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="e.g. Deposit not confirmed, Withdrawal query" value={fields.subject} onChange={set("subject")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      value={fields.message}
                      onChange={set("message")}
                      className="flex min-h-[130px] w-full rounded-glass border border-white/10 bg-surface-container-lowest px-4 py-3 text-sm text-white placeholder:text-on-surface-variant focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/20"
                      placeholder="Describe your question or issue in detail..."
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </GlassCard>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

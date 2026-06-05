"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeIn } from "@/components/animations/motion-components";
import { faqItems } from "@/lib/data/faq";
import { Button } from "@/components/ui/button";

export function FAQSection() {
  return (
    <section className="bg-surface section-padding">
      <div className="mx-auto max-w-3xl">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white">OPERATIONAL CLARITY</h2>
          <p className="mt-4 text-on-surface-variant">
            Everything you need to know about investing with QuantumVest.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.slice(0, 4).map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/faq">View All FAQs</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeIn } from "@/components/animations/motion-components";
import { faqItems } from "@/lib/data/faq";

export function FAQPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-3xl">
        <FadeIn className="mb-16 text-center">
          <span className="label-mono text-neon">FAQ</span>
          <h1 className="mt-4 text-4xl font-extrabold text-white">
            OPERATIONAL <span className="text-neon neon-glow-text">CLARITY</span>
          </h1>
          <p className="mt-4 text-on-surface-variant">
            Answers to the most common questions about investing with QuantumVest.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Accordion type="single" collapsible>
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </div>
  );
}

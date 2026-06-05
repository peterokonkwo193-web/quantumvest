"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import { FadeIn, GlassCard } from "@/components/animations/motion-components";
import { blogPosts } from "@/lib/data/blog";

export function BlogPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-16 text-center">
          <span className="label-mono text-neon">Investment Insights</span>
          <h1 className="mt-4 text-4xl font-extrabold text-white md:text-5xl">
            Knowledge <span className="text-neon neon-glow-text">Centre</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-on-surface-variant">
            Guides, strategies, and insights to help you invest smarter and grow your portfolio with confidence.
          </p>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2">
          {blogPosts.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.1}>
              <GlassCard className="overflow-hidden p-0">
                <div className="relative h-52">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-neon px-3 py-1 text-xs font-bold text-black">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-4 text-xs text-on-surface-variant">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime} read
                    </span>
                  </div>
                  <h2 className="mb-3 text-xl font-bold text-white">{post.title}</h2>
                  <p className="text-on-surface-variant">{post.excerpt}</p>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-16 text-center">
          <div className="inline-block rounded-[24px] border border-neon/20 bg-neon/5 px-8 py-6">
            <p className="label-mono text-neon">More Articles Coming Soon</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Subscribe to our newsletter or follow us for the latest investment insights.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

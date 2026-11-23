"use client";

import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { testimonials } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative scroll-mt-24 overflow-hidden bg-slate-950 py-24 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5">
        <SectionHeading
          light
          eyebrow="Real results"
          title="Loved by clients across the world"
          subtitle="Here's what people say after working with us."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="relative rounded-3xl bg-white/[0.04] p-8 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-white/[0.07] hover:ring-emerald-500/40"
            >
              <Quote size={40} className="absolute right-6 top-6 text-emerald-500/20" />
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={16} fill="currentColor" />
                ))}
              </div>
              <blockquote className="mt-5 leading-relaxed text-slate-300">&ldquo;{t.text}&rdquo;</blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 font-bold text-white">
                  {t.name[0]}
                </span>
                <span>
                  <span className="block font-semibold text-white">{t.name}</span>
                  <span className="block text-sm text-slate-400">{t.location}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

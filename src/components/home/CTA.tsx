"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="px-5 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 px-8 py-16 text-center shadow-2xl shadow-emerald-900/20 md:py-20"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border-[40px] border-white/10"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />

        <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-5xl">
          Ready to start your health journey?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-emerald-50/90">
          Book your first consultation today and get a plan made just for you.
        </p>
        <div className="relative mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="#plans"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-emerald-700 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Book a Consultation
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#faq"
            className="rounded-full px-8 py-4 font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10"
          >
            Have questions?
          </a>
        </div>
      </motion.div>
    </section>
  );
}

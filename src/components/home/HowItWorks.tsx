"use client";

import { motion } from "motion/react";
import { CalendarCheck, ClipboardList, Salad } from "lucide-react";
import { steps } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";

const icons = [ClipboardList, CalendarCheck, Salad];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="How it works"
          title="Your plan in 3 simple steps"
          subtitle="From booking to your first meal plan in less than a day."
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          {/* Connecting line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute left-[16%] right-[16%] top-[52px] hidden h-0.5 origin-left bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 md:block"
          />

          {steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-xl hover:shadow-emerald-900/5"
              >
                <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon size={26} />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white ring-4 ring-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-7 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

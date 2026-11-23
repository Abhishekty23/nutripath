"use client";

import { motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { plans } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Plans() {
  return (
    <section id="plans" className="relative scroll-mt-24 overflow-hidden bg-slate-50 py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Plans & pricing"
          title="Pick the plan that fits your goal"
          subtitle="Simple, transparent pricing. No hidden charges."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative flex flex-col rounded-3xl p-7 transition-shadow ${
                plan.popular
                  ? "bg-slate-900 text-white shadow-2xl shadow-emerald-900/30 ring-2 ring-emerald-500 lg:scale-105"
                  : "bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-xl"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 inline-flex whitespace-nowrap -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                  <Sparkles size={12} /> MOST POPULAR
                </span>
              )}
              <h3 className={`text-lg font-semibold ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.title}</h3>
              <p className={`mt-1 text-sm ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.duration}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className={`text-4xl font-extrabold tracking-tight ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  ₹{plan.price.toLocaleString("en-IN")}
                </span>
              </p>
              <p className={`mt-3 text-sm leading-relaxed ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                {plan.description}
              </p>

              <div className={`my-6 h-px ${plan.popular ? "bg-white/10" : "bg-slate-100"}`} />

              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.popular ? "text-slate-200" : "text-slate-700"}`}>
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                        plan.popular ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Booking page comes on Day 4 */}
              <a
                href={`/book/${plan.id}`}
                className={`group mt-8 inline-flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold transition-all ${
                  plan.popular
                    ? "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/40"
                    : "bg-slate-900 text-white hover:bg-emerald-600"
                }`}
              >
                Book Now
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

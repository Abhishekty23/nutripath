"use client";

import { motion } from "motion/react";
import { Award, GraduationCap, Globe } from "lucide-react";
import { about, site } from "@/lib/data";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";

const highlightIcons = [GraduationCap, Award, Globe];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto w-full max-w-sm"
        >
          {/* Replace this block with a real photo later: <img src="/nutritionist.jpg" ... /> */}
          <div className="absolute -inset-4 rotate-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-200 to-teal-200" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-700 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
            <div className="absolute inset-0 grid place-items-center text-8xl font-extrabold tracking-tight text-white/90">
              AM
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="absolute -bottom-6 -right-6 rounded-2xl bg-white px-6 py-4 shadow-2xl ring-1 ring-slate-100"
          >
            <p className="text-3xl font-extrabold text-slate-900">
              <CountUp to={8} suffix="+" />
            </p>
            <p className="text-sm text-slate-500">years of experience</p>
          </motion.div>
        </motion.div>

        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Meet your nutritionist
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{site.nutritionist}</h2>
            <p className="mt-2 font-medium text-emerald-600">{site.title}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">{about.bio}</p>
          </Reveal>
          <ul className="mt-8 space-y-3">
            {about.highlights.map((h, i) => {
              const Icon = highlightIcons[i];
              return (
                <Reveal key={h} delay={0.2 + i * 0.1} y={0} x={30}>
                  <li className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3 font-medium text-slate-800 transition-colors hover:bg-emerald-50">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <Icon size={18} />
                    </span>
                    {h}
                  </li>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

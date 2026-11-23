"use client";

import { motion } from "motion/react";
import { ArrowRight, CalendarCheck, Check, Flame, Salad, Sparkles, Star } from "lucide-react";
import CountUp from "@/components/ui/CountUp";

const meals = [
  { time: "Breakfast", item: "Oats with banana & almonds", kcal: 320 },
  { time: "Lunch", item: "Dal, brown rice & salad", kcal: 480 },
  { time: "Snack", item: "Greek yogurt & berries", kcal: 180 },
  { time: "Dinner", item: "Paneer tikka & veggies", kcal: 420 },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#ecfdf5_0%,_#ffffff_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-20 top-40 h-96 w-96 rounded-full bg-teal-300/25 blur-3xl"
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 lg:grid-cols-[1.1fr_1fr]">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100"
          >
            <Sparkles size={15} className="text-emerald-500" />
            Personalised nutrition, made simple
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-7xl"
          >
            Eat better.
            <br />
            <span className="relative inline-block pb-2">
              <span className="animate-gradient bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 bg-[length:200%_auto] bg-clip-text text-transparent">
                Feel amazing.
              </span>
              <svg viewBox="0 0 300 12" className="absolute -bottom-1 left-0 w-full" aria-hidden>
                <motion.path
                  d="M2 9C80 3 220 3 298 9"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.9, ease: "easeInOut" }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-7 max-w-lg text-lg leading-relaxed text-slate-600">
            A diet plan built around your body, your goals and the food you actually enjoy. Book a 1-on-1
            consultation online in under 2 minutes.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <a
              href="#plans"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-emerald-600 px-7 py-4 font-semibold text-white shadow-xl shadow-emerald-600/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-600/40"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              View Plans
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="rounded-full bg-white px-7 py-4 font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:text-emerald-700 hover:ring-emerald-300"
            >
              How it works
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex items-center gap-5">
            <div className="flex -space-x-3">
              {["P", "R", "S", "A"].map((l, i) => (
                <span
                  key={l}
                  className="grid h-11 w-11 place-items-center rounded-full border-2 border-white text-sm font-bold text-white shadow"
                  style={{ background: ["#10b981", "#14b8a6", "#0ea5e9", "#f59e0b"][i] }}
                >
                  {l}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
                <span className="ml-1 text-sm font-semibold text-slate-900">
                  <CountUp to={4.9} decimals={1} />
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Trusted by{" "}
                <span className="font-semibold text-slate-900">
                  <CountUp to={2000} suffix="+" />
                </span>{" "}
                clients
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated meal plan card */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-[2rem] bg-white p-6 shadow-2xl shadow-emerald-900/10 ring-1 ring-slate-100"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                  <Salad size={22} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Today&apos;s meal plan</p>
                  <p className="text-sm text-slate-500">Weight Loss · Week 3</p>
                </div>
              </div>
              <span className="whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                1,400 kcal
              </span>
            </div>

            <ul className="mt-6 space-y-2.5">
              {meals.map((m, i) => (
                <motion.li
                  key={m.time}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.15, duration: 0.5 }}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition-colors hover:bg-emerald-50"
                >
                  <div className="flex items-center gap-3">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 + i * 0.15, type: "spring", stiffness: 300 }}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{m.time}</p>
                      <p className="text-sm font-medium text-slate-800">{m.item}</p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm text-slate-500">{m.kcal} kcal</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Weekly goal</span>
                <span className="font-semibold text-slate-900">-0.8 kg of -1 kg</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ delay: 1.6, duration: 1.4, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { delay: 1.4 },
              scale: { delay: 1.4 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -top-10 right-10 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-100 sm:flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-orange-500">
              <Flame size={18} />
            </span>
            <div>
              <p className="text-xs text-slate-500">Protein today</p>
              <p className="font-bold text-slate-900">92 g</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, 8, 0] }}
            transition={{
              opacity: { delay: 1.7 },
              scale: { delay: 1.7 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -bottom-8 -right-4 hidden items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-xl sm:flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500">
              <CalendarCheck size={18} />
            </span>
            <div>
              <p className="text-xs text-slate-400">Next consultation</p>
              <p className="font-semibold">Tomorrow, 10:30 AM</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

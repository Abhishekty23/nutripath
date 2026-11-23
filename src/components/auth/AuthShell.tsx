"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarCheck, Leaf, Salad, ShieldCheck } from "lucide-react";

const points = [
  { icon: Salad, text: "Meal plans built around food you enjoy" },
  { icon: CalendarCheck, text: "Book consultations in under 2 minutes" },
  { icon: ShieldCheck, text: "Your health data stays private" },
];

// Split-screen layout shared by the Login and Sign up pages.
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full border-[50px] border-white/5"
        />

        <Link href="/" className="relative flex items-center gap-2.5 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <Leaf size={19} />
          </span>
          NutriPath
        </Link>

        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-md text-4xl font-bold leading-tight tracking-tight"
          >
            Your journey to better health starts here.
          </motion.h2>
          <ul className="mt-10 space-y-4">
            {points.map((p, i) => (
              <motion.li
                key={p.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                className="flex items-center gap-3 text-emerald-50"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <p.icon size={18} />
                </span>
                {p.text}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-emerald-100/70">Demo project · Not a real medical service</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-white px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="w-full max-w-md"
        >
          <Link href="/" className="mb-10 flex items-center gap-2.5 text-xl font-bold text-slate-900 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Leaf size={19} />
            </span>
            NutriPath
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

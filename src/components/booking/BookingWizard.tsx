"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { confirmPayment, createBooking, startPayment, type HealthDetails } from "@/app/book/actions";
import FormAlert from "@/components/auth/FormAlert";
import type { Plan } from "@/lib/data";

type Slot = { id: string; starts_at: string };
type Customer = { name: string; email: string; phone: string };

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const TZ = "Asia/Kolkata";
const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...opts }).format(new Date(iso));

const STEPS = ["Pick a time", "Your details", "Review & pay"];
const GOALS = ["Lose weight", "Gain muscle", "Manage PCOS / thyroid", "Eat healthier", "Improve energy", "Other"];
const DIETS: { value: HealthDetails["dietType"]; label: string }[] = [
  { value: "veg", label: "Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "non-veg", label: "Non-vegetarian" },
  { value: "vegan", label: "Vegan" },
];

const input =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15";

export default function BookingWizard({ plan, customer }: { plan: Plan; customer: Customer }) {
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [health, setHealth] = useState<HealthDetails>({
    age: 0,
    heightCm: 0,
    weightKg: 0,
    goal: "",
    dietType: "veg",
    allergies: "",
    notes: "",
  });
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Load free slots
  useEffect(() => {
    const from = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    createClient()
      .from("slots")
      .select("id, starts_at")
      .eq("is_booked", false)
      .gt("starts_at", from)
      .order("starts_at")
      .limit(400)
      .then(({ data, error }) => {
        if (error) return setSlotsError("Couldn't load available times. Please refresh the page.");
        setSlots(data ?? []);
        if (data?.length) setDay(dayKey(data[0].starts_at));
      });
  }, []);

  // Load Razorpay Checkout
  useEffect(() => {
    if (document.getElementById("razorpay-checkout")) return;
    const s = document.createElement("script");
    s.id = "razorpay-checkout";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    (slots ?? []).forEach((s) => {
      const k = dayKey(s.starts_at);
      map.set(k, [...(map.get(k) ?? []), s]);
    });
    return [...map.entries()];
  }, [slots]);
  const daySlots = days.find(([k]) => k === day)?.[1] ?? [];

  const healthValid =
    health.age >= 10 && health.age <= 100 && health.heightCm >= 100 && health.heightCm <= 250 &&
    health.weightKg >= 25 && health.weightKg <= 300 && health.goal.trim().length > 0;

  async function pay() {
    if (!slot) return;
    setBusy(true);
    setError(null);

    // 1. Reserve the slot (only once, even if the person retries payment)
    let id = bookingId;
    if (!id) {
      const res = await createBooking(plan.id, slot.id, health);
      if (!res.ok) {
        setBusy(false);
        setError(res.error);
        if (/slot/i.test(res.error)) {
          setSlots((prev) => prev?.filter((s) => s.id !== slot.id) ?? null);
          setSlot(null);
          setStep(0);
        }
        return;
      }
      id = res.bookingId;
      setBookingId(id);
    }

    // 2. Create the Razorpay order on the server
    const order = await startPayment(id);
    if (!order.ok) {
      setBusy(false);
      return setError(order.error);
    }
    if (!window.Razorpay) {
      setBusy(false);
      return setError("The payment window couldn't load. Please check your connection and try again.");
    }

    // 3. Open Razorpay Checkout
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: "INR",
      name: "NutriPath",
      description: plan.title,
      order_id: order.orderId,
      prefill: { name: customer.name, email: customer.email, contact: customer.phone },
      theme: { color: "#059669" },
      timeout: 600,
      modal: { ondismiss: () => setBusy(false) },
      handler: async (r: RazorpayResponse) => {
        const result = await confirmPayment({
          bookingId: id!,
          orderId: r.razorpay_order_id,
          paymentId: r.razorpay_payment_id,
          signature: r.razorpay_signature,
        });
        setBusy(false);
        if (result.ok) setDone(true);
        else setError(result.error);
      },
    });
    rzp.on("payment.failed", (r) => {
      setBusy(false);
      setError(r.error?.description ? `Payment failed: ${r.error.description}` : "Payment failed. Please try again.");
    });
    rzp.open();
  }

  if (done && slot) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-100"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, delay: 0.15 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
        >
          <CheckCircle2 size={40} />
        </motion.span>
        <h2 className="mt-6 text-3xl font-bold text-slate-900">You&apos;re booked!</h2>
        <p className="mt-2 text-slate-600">
          {plan.title} · {fmt(slot.starts_at, { weekday: "long", day: "numeric", month: "long" })} at{" "}
          {fmt(slot.starts_at, { hour: "numeric", minute: "2-digit" })}
        </p>
        <p className="mt-1 text-sm text-slate-500">We&apos;ll email your video call link before the consultation.</p>
        <Link
          href="/dashboard?booked=1"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 font-semibold text-white hover:bg-emerald-700"
        >
          Go to my dashboard <ArrowRight size={18} />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        {/* Progress */}
        <ol className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${
                  i < step ? "bg-emerald-600 text-white" : i === step ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {i < step ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`hidden text-sm font-semibold sm:block ${i === step ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
              {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded ${i < step ? "bg-emerald-500" : "bg-slate-200"}`} />}
            </li>
          ))}
        </ol>

        <FormAlert message={error} />

        <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-slate-900">Choose a date and time</h2>
                <p className="mt-1 text-sm text-slate-500">All times are India time (IST). Each consultation is 30 minutes.</p>

                {slotsError && <p className="mt-6 text-red-600">{slotsError}</p>}
                {!slots && !slotsError && (
                  <div className="mt-10 flex justify-center text-slate-400">
                    <Loader2 className="animate-spin" />
                  </div>
                )}
                {slots && slots.length === 0 && (
                  <p className="mt-8 rounded-2xl bg-slate-50 p-6 text-center text-slate-600">
                    No free slots right now. Please check back soon.
                  </p>
                )}

                {days.length > 0 && (
                  <>
                    <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-2">
                      {days.map(([k, list]) => {
                        const active = k === day;
                        return (
                          <button
                            key={k}
                            onClick={() => {
                              setDay(k);
                              setSlot(null);
                            }}
                            className={`flex min-w-[76px] flex-col items-center rounded-2xl px-3 py-3 ring-1 transition ${
                              active ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-200 hover:ring-emerald-300"
                            }`}
                          >
                            <span className="text-xs font-semibold uppercase">{fmt(list[0].starts_at, { weekday: "short" })}</span>
                            <span className="text-2xl font-bold">{fmt(list[0].starts_at, { day: "numeric" })}</span>
                            <span className={`text-xs ${active ? "text-emerald-100" : "text-slate-400"}`}>
                              {fmt(list[0].starts_at, { month: "short" })}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {daySlots.map((s) => {
                        const active = slot?.id === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setSlot(s)}
                            className={`rounded-xl py-3 text-sm font-semibold ring-1 transition ${
                              active ? "bg-slate-900 text-white ring-slate-900" : "bg-slate-50 text-slate-700 ring-slate-200 hover:ring-emerald-400"
                            }`}
                          >
                            {fmt(s.starts_at, { hour: "numeric", minute: "2-digit" })}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!slot}
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-slate-900">Tell us about yourself</h2>
                <p className="mt-1 text-sm text-slate-500">This helps your nutritionist prepare. Only they can see it.</p>

                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Age</span>
                    <input type="number" min={10} max={100} value={health.age || ""} onChange={(e) => setHealth({ ...health, age: Number(e.target.value) })} placeholder="28" className={input} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Height (cm)</span>
                    <input type="number" min={100} max={250} value={health.heightCm || ""} onChange={(e) => setHealth({ ...health, heightCm: Number(e.target.value) })} placeholder="165" className={input} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Weight (kg)</span>
                    <input type="number" min={25} max={300} step="0.1" value={health.weightKg || ""} onChange={(e) => setHealth({ ...health, weightKg: Number(e.target.value) })} placeholder="68" className={input} />
                  </label>
                </div>

                <p className="mt-6 text-sm font-medium text-slate-700">Main goal</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setHealth({ ...health, goal: g })}
                      className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                        health.goal === g ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-200 hover:ring-emerald-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-sm font-medium text-slate-700">Food preference</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DIETS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setHealth({ ...health, dietType: d.value })}
                      className={`rounded-xl px-3 py-2.5 text-sm font-medium ring-1 transition ${
                        health.dietType === d.value ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:ring-emerald-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-medium text-slate-700">Allergies or foods you avoid (optional)</span>
                  <input value={health.allergies} onChange={(e) => setHealth({ ...health, allergies: e.target.value })} placeholder="e.g. peanuts, lactose" className={input} />
                </label>
                <label className="mt-5 block">
                  <span className="text-sm font-medium text-slate-700">Anything else we should know? (optional)</span>
                  <textarea rows={3} value={health.notes} onChange={(e) => setHealth({ ...health, notes: e.target.value })} placeholder="Daily routine, health conditions, medications…" className={input} />
                </label>

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    disabled={!healthValid}
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && slot && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-xl font-bold text-slate-900">Review and pay</h2>
                <dl className="mt-6 divide-y divide-slate-100 rounded-2xl bg-slate-50 px-5">
                  {[
                    ["Plan", plan.title],
                    ["Date", fmt(slot.starts_at, { weekday: "long", day: "numeric", month: "long" })],
                    ["Time", `${fmt(slot.starts_at, { hour: "numeric", minute: "2-digit" })} IST (30 min)`],
                    ["Name", customer.name],
                    ["Goal", health.goal],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3.5 text-sm">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="text-right font-medium text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                  <ShieldCheck size={16} className="text-emerald-600" /> Payments are processed securely by Razorpay. This is a demo in test mode.
                </div>

                <div className="mt-8 flex justify-between">
                  <button disabled={busy} onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    disabled={busy}
                    onClick={pay}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-70"
                  >
                    {busy ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                    Pay ₹{plan.price.toLocaleString("en-IN")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Summary */}
      <aside>
        <div className="sticky top-28 rounded-3xl bg-slate-900 p-7 text-white shadow-xl">
          <p className="text-sm font-medium text-emerald-300">Your booking</p>
          <h3 className="mt-1 text-2xl font-bold">{plan.title}</h3>
          <p className="text-sm text-slate-400">{plan.duration}</p>
          <div className="my-6 h-px bg-white/10" />
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-3">
              <CalendarDays size={18} className="text-emerald-400" />
              {slot ? fmt(slot.starts_at, { weekday: "short", day: "numeric", month: "short" }) : <span className="text-slate-500">Pick a date</span>}
            </p>
            <p className="flex items-center gap-3">
              <Clock size={18} className="text-emerald-400" />
              {slot ? `${fmt(slot.starts_at, { hour: "numeric", minute: "2-digit" })} IST` : <span className="text-slate-500">Pick a time</span>}
            </p>
          </div>
          <div className="my-6 h-px bg-white/10" />
          <div className="flex items-baseline justify-between">
            <span className="text-slate-400">Total</span>
            <span className="text-3xl font-extrabold">₹{plan.price.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

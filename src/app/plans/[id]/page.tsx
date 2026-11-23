import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, ClipboardList, Clock, Salad, ShieldCheck, Video } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/ui/Reveal";
import { formatPrice, getPlan, getPlans } from "@/lib/plans";

export async function generateStaticParams() {
  const plans = await getPlans();
  return plans.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/plans/[id]">): Promise<Metadata> {
  const { id } = await params;
  const plan = await getPlan(id);
  return plan
    ? { title: `${plan.title} | NutriPath`, description: plan.description }
    : { title: "Plan not found | NutriPath" };
}

const steps = [
  { icon: CalendarCheck, title: "Pick a time", text: "Choose a consultation slot that suits you." },
  { icon: ClipboardList, title: "Share your details", text: "A short health form helps us personalise your plan." },
  { icon: Video, title: "Meet your nutritionist", text: "A 1-on-1 video call to understand your goals." },
  { icon: Salad, title: "Get your meal plan", text: "Your plan appears in your dashboard within 24 hours." },
];

export default async function PlanDetailPage({ params }: PageProps<"/plans/[id]">) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) notFound();

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-emerald-50 to-slate-50 pb-24 pt-36 text-slate-900">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-5">
            <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900">
              <ArrowLeft size={16} /> All plans
            </Link>
            <Reveal>
              {plan.popular && (
                <span className="mt-6 inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                  Most popular
                </span>
              )}
              <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight md:text-6xl">{plan.title}</h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">{plan.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-6 font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <Clock size={18} /> {plan.duration}
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={18} /> Private & secure
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-12 grid max-w-6xl gap-8 px-5 pb-24 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <Reveal>
              <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
                <h2 className="text-xl font-bold text-slate-900">What&apos;s included</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check size={15} strokeWidth={3} />
                      </span>
                      <span className="font-medium text-slate-800">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
                <h2 className="text-xl font-bold text-slate-900">How it works</h2>
                <ol className="mt-6 space-y-5">
                  {steps.map((s, i) => (
                    <li key={s.title} className="flex gap-4">
                      <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
                        <s.icon size={20} />
                        <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[10px] font-bold ring-2 ring-white">
                          {i + 1}
                        </span>
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{s.title}</p>
                        <p className="text-slate-600">{s.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>

          {/* Sticky booking card */}
          <div>
            <Reveal delay={0.15}>
              <div className="sticky top-28 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-900/5 ring-1 ring-slate-100">
                <p className="text-sm font-medium text-slate-500">Total price</p>
                <p className="mt-1 text-5xl font-extrabold tracking-tight text-slate-900">{formatPrice(plan.price)}</p>
                <p className="mt-1 text-sm text-slate-500">One-time payment · {plan.duration}</p>
                <Link
                  href={`/book/${plan.id}`}
                  className="group mt-8 flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
                >
                  Book this plan
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <ul className="mt-6 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Reschedule up to 12 hours before</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Secure online payment</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Plan delivered to your dashboard</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

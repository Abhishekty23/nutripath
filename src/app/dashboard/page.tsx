import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Salad, TrendingDown } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Reveal from "@/components/ui/Reveal";

// Always rendered per request: depends on who is logged in.
export const instant = false;

export const metadata: Metadata = { title: "My dashboard | NutriPath" };

export default async function DashboardPage() {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (profile?.role === "admin") redirect("/admin");

  const name = profile?.full_name || user.email?.split("@")[0] || "there";

  const [{ count: bookingCount }, { count: planCount }] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("diet_plans").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Bookings", value: bookingCount ?? 0, icon: CalendarDays, hint: "Consultations booked" },
    { label: "Diet plans", value: planCount ?? 0, icon: Salad, hint: "Plans from your nutritionist" },
    { label: "Progress", value: "-", icon: TrendingDown, hint: "Start logging your weight" },
  ];

  return (
    <DashboardShell name={name}>
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">My dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Hi {name.split(" ")[0]} 👋</h1>
        <p className="mt-2 text-slate-600">Here&apos;s an overview of your nutrition journey.</p>
      </Reveal>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={0.08 * i} y={20}>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{c.label}</p>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <c.icon size={19} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{c.value}</p>
              <p className="mt-1 text-sm text-slate-500">{c.hint}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {!bookingCount && (
        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-white md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">Book your first consultation</h2>
              <p className="mt-1 text-emerald-50/90">Choose a plan and pick a time that suits you.</p>
            </div>
            <Link
              href="/#plans"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow-lg transition hover:-translate-y-0.5"
            >
              View plans <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      )}
    </DashboardShell>
  );
}

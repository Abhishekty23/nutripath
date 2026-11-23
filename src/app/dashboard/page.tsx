import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, CalendarClock, CalendarDays, Clock, Salad, TrendingDown, X } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import FormAlert from "@/components/auth/FormAlert";
import Reveal from "@/components/ui/Reveal";
import ActionButton from "@/components/admin/ActionButton";
import WeightTracker, { type ProgressLog } from "@/components/dashboard/WeightTracker";
import { dayKeyIST } from "@/lib/format";
import { cancelMyBooking } from "./actions";

// Always rendered per request: depends on who is logged in.
export const instant = false;

export const metadata: Metadata = { title: "My dashboard | NutriPath" };

type BookingRow = {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  amount: number;
  reschedule_count: number;
  plans: { title: string } | null;
  slots: { starts_at: string } | null;
};

const STATUS: Record<BookingRow["status"], { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  pending: { label: "Awaiting payment", className: "bg-amber-50 text-amber-700 ring-amber-100" },
  completed: { label: "Completed", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 ring-red-100" },
};

// Runs on the server for each request (this page is never cached).
function isFuture(iso: string) {
  return new Date(iso).getTime() > Date.now();
}

// Clients can change a booking up to 24 hours before it starts
function canChange(iso: string) {
  return new Date(iso).getTime() - Date.now() > 24 * 60 * 60 * 1000;
}

function todayIST() {
  return dayKeyIST(new Date().toISOString());
}

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(new Date(iso));

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (profile?.role === "admin") redirect("/admin");

  const sp = await searchParams;
  const booked = sp.booked;
  const isDemo = user.email === "demo-client@example.com";
  const msg = typeof sp.msg === "string" ? sp.msg : null;
  const error = typeof sp.error === "string" ? sp.error : null;
  const name = profile?.full_name || user.email?.split("@")[0] || "there";

  const [{ data: bookingsData }, { data: dietPlansData }, { data: logsData }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, status, amount, reschedule_count, plans(title), slots(starts_at)")
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .returns<BookingRow[]>(),
    supabase
      .from("diet_plans")
      .select("id, title, meal_text, created_at")
      .order("created_at", { ascending: false })
      .returns<{ id: string; title: string; meal_text: string | null; created_at: string }[]>(),
    supabase.from("progress_logs").select("id, weight_kg, logged_on").order("logged_on").returns<ProgressLog[]>(),
  ]);
  const logs = logsData ?? [];
  const weightChange =
    logs.length >= 2 ? Math.round((Number(logs[logs.length - 1].weight_kg) - Number(logs[0].weight_kg)) * 10) / 10 : null;
  const dietPlans = dietPlansData ?? [];
  const bookings = bookingsData ?? [];
  const upcoming = bookings.filter((b) => b.status === "confirmed" && b.slots && isFuture(b.slots.starts_at));

  const cards = [
    { label: "Upcoming", value: upcoming.length, icon: CalendarDays, hint: "Confirmed consultations" },
    { label: "Diet plans", value: dietPlans.length, icon: Salad, hint: "Plans from your nutritionist" },
    {
      label: "Progress",
      value: weightChange === null ? "-" : `${weightChange > 0 ? "+" : ""}${weightChange} kg`,
      icon: TrendingDown,
      hint: logs.length ? `${logs.length} weigh-in${logs.length === 1 ? "" : "s"} logged` : "Log your first weigh-in below",
    },
  ];

  return (
    <DashboardShell name={name}>
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">My dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Hi {name.split(" ")[0]} 👋</h1>
        <p className="mt-2 text-slate-600">Here&apos;s an overview of your nutrition journey.</p>
      </Reveal>

      {isDemo && (
        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
          <strong>Demo account:</strong> feel free to log weights, reschedule or cancel. Everything resets the next time someone opens the demo.
        </div>
      )}

      {(booked || msg || error) && (
        <div className="mt-6">
          <FormAlert
            type={error ? "error" : "success"}
            message={error ?? msg ?? "Payment received. Your consultation is confirmed! A confirmation email is on its way."}
          />
        </div>
      )}

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

      <Reveal delay={0.1}>
        <section id="progress" className="mt-8 scroll-mt-24 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <TrendingDown size={20} className="text-emerald-600" /> My progress
          </h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">Weigh yourself once a week, same time of day, and log it here. Your nutritionist sees it too.</p>
          <WeightTracker logs={logs} today={todayIST()} />
        </section>
      </Reveal>

      {dietPlans.length > 0 && (
        <Reveal delay={0.12}>
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Salad size={20} className="text-emerald-600" /> My diet plans
            </h2>
            <div className="mt-6 space-y-4">
              {dietPlans.map((p, i) => (
                <details key={p.id} open={i === 0} className="group rounded-2xl bg-emerald-50/50 p-5 ring-1 ring-emerald-100">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <span>
                      <span className="block font-semibold text-slate-900">{p.title}</span>
                      <span className="text-xs text-slate-500">
                        From your nutritionist · {fmt(p.created_at, { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-emerald-700 group-open:hidden">Open</span>
                  </summary>
                  {p.meal_text && (
                    <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{p.meal_text}</pre>
                  )}
                </details>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {bookings.length > 0 ? (
        <Reveal delay={0.15}>
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">My bookings</h2>
              <Link href="/plans" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                Book another
              </Link>
            </div>
            <ul className="mt-6 divide-y divide-slate-100">
              {bookings.map((b) => (
                <li key={b.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <CalendarDays size={20} />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{b.plans?.title ?? "Consultation"}</p>
                      {b.slots && (
                        <p className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock size={14} />
                          {fmt(b.slots.starts_at, { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                          {fmt(b.slots.starts_at, { hour: "numeric", minute: "2-digit" })} IST
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 pl-16 sm:items-end sm:pl-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">₹{b.amount.toLocaleString("en-IN")}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS[b.status].className}`}>
                        {STATUS[b.status].label}
                      </span>
                    </div>
                    {b.status === "confirmed" && b.slots && isFuture(b.slots.starts_at) &&
                      (canChange(b.slots.starts_at) ? (
                        <div className="flex items-center gap-2">
                          {b.reschedule_count < 2 && (
                            <Link
                              href={`/dashboard/bookings/${b.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50"
                            >
                              <CalendarClock size={14} /> Reschedule
                            </Link>
                          )}
                          <details className="group relative">
                            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-100 transition hover:bg-red-50">
                              <X size={14} /> Cancel
                            </summary>
                            <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl bg-white p-4 text-left shadow-xl ring-1 ring-slate-200">
                              <p className="text-sm font-semibold text-slate-900">Cancel this consultation?</p>
                              <p className="mt-1 text-xs text-slate-500">The time slot is released. Any refund due goes back to your original payment method.</p>
                              <form action={cancelMyBooking} className="mt-3">
                                <input type="hidden" name="id" value={b.id} />
                                <ActionButton variant="danger" className="w-full !py-1.5 text-xs">Yes, cancel booking</ActionButton>
                              </form>
                            </div>
                          </details>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Changes close 24h before the call</p>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      ) : (
        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-white md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">Book your first consultation</h2>
              <p className="mt-1 text-emerald-50/90">Choose a plan and pick a time that suits you.</p>
            </div>
            <Link
              href="/plans"
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

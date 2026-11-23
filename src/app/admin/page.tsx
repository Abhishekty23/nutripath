import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarClock, CalendarDays, ClipboardList, IndianRupee, Salad, Users } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Reveal from "@/components/ui/Reveal";
import { requireAdminPage } from "@/lib/admin-guard";
import { releaseExpiredHolds } from "@/lib/holds";
import { fmtDateTime, rupees } from "@/lib/format";

export const instant = false;
export const metadata: Metadata = { title: "Admin | NutriPath" };

type Upcoming = {
  id: string;
  user_id: string;
  plans: { title: string } | null;
  slots: { starts_at: string } | null;
  profiles: { full_name: string | null } | null;
};

function nowIso() {
  return new Date().toISOString();
}

export default async function AdminPage() {
  const { supabase, profile } = await requireAdminPage("/admin");
  await releaseExpiredHolds();

  const [clients, bookings, plans, paid, upcomingRes, freeSlots] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).in("status", ["confirmed", "completed"]),
    supabase.from("plans").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("bookings").select("amount, user_id").in("status", ["confirmed", "completed"]),
    supabase
      .from("bookings")
      .select("id, user_id, plans(title), slots!inner(starts_at), profiles(full_name)")
      .eq("status", "confirmed")
      .gt("slots.starts_at", nowIso())
      .limit(20)
      .returns<Upcoming[]>(),
    supabase.from("slots").select("*", { count: "exact", head: true }).eq("is_booked", false).gt("starts_at", nowIso()),
  ]);

  const revenue = (paid.data ?? []).reduce((sum, b) => sum + (b.amount ?? 0), 0);
  const upcoming = [...(upcomingRes.data ?? [])]
    .sort((a, b) => new Date(a.slots!.starts_at).getTime() - new Date(b.slots!.starts_at).getTime())
    .slice(0, 6);

  // Paying clients who haven't been sent a diet plan yet
  const paidUserIds = [...new Set((paid.data ?? []).map((b) => b.user_id))];
  const { data: withPlans } = paidUserIds.length
    ? await supabase.from("diet_plans").select("user_id").in("user_id", paidUserIds)
    : { data: [] as { user_id: string }[] };
  const needPlan = paidUserIds.filter((id) => !(withPlans ?? []).some((p) => p.user_id === id)).length;

  const stats = [
    { label: "Clients", value: clients.count ?? 0, icon: Users, href: "/admin/clients" },
    { label: "Paid bookings", value: bookings.count ?? 0, icon: CalendarDays, href: "/admin/bookings" },
    { label: "Active plans", value: plans.count ?? 0, icon: ClipboardList, href: "/admin/plans" },
    { label: "Revenue", value: rupees(revenue), icon: IndianRupee, href: "/admin/bookings?filter=all" },
  ];

  return (
    <DashboardShell name={profile.full_name || "Admin"} badge="Admin">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Admin panel</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Hello, {(profile.full_name || "there").split(" ")[0]}
        </h1>
        <p className="mt-2 text-slate-600">Here&apos;s what&apos;s happening with your practice.</p>
      </Reveal>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={0.06 * i} y={20}>
            <Link href={s.href} className="block rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                  <s.icon size={18} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{s.value}</p>
            </Link>
          </Reveal>
        ))}
      </div>

      {(needPlan > 0 || (freeSlots.count ?? 0) < 12) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {needPlan > 0 && (
            <Link href="/admin/clients" className="flex items-center gap-4 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-100 transition hover:bg-amber-100/60">
              <Salad className="text-amber-600" />
              <p className="flex-1 text-sm font-medium text-amber-900">
                {needPlan} paying client{needPlan === 1 ? " is" : "s are"} waiting for a diet plan.
              </p>
              <ArrowRight size={18} className="text-amber-600" />
            </Link>
          )}
          {(freeSlots.count ?? 0) < 12 && (
            <Link href="/admin/availability" className="flex items-center gap-4 rounded-2xl bg-sky-50 p-5 ring-1 ring-sky-100 transition hover:bg-sky-100/60">
              <CalendarClock className="text-sky-600" />
              <p className="flex-1 text-sm font-medium text-sky-900">Only {freeSlots.count ?? 0} free slots left. Add more availability.</p>
              <ArrowRight size={18} className="text-sky-600" />
            </Link>
          )}
        </div>
      )}

      <Reveal delay={0.2}>
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upcoming consultations</h2>
            <Link href="/admin/bookings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="mt-6 text-slate-500">No upcoming consultations.</p>
          ) : (
            <ul className="mt-6 divide-y divide-slate-100">
              {upcoming.map((u) => (
                <li key={u.id}>
                  <Link href={`/admin/clients/${u.user_id}`} className="flex items-center gap-4 py-4 transition hover:bg-slate-50/60">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <CalendarDays size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{u.profiles?.full_name || "Client"}</p>
                      <p className="text-sm text-slate-500">{u.plans?.title}</p>
                    </div>
                    <p className="text-right text-sm font-medium text-slate-700">{u.slots && fmtDateTime(u.slots.starts_at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>
    </DashboardShell>
  );
}

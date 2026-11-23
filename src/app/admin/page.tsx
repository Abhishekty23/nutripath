import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, ClipboardList, IndianRupee, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Reveal from "@/components/ui/Reveal";

// Always rendered per request: depends on who is logged in.
export const instant = false;

export const metadata: Metadata = { title: "Admin | NutriPath" };

export default async function AdminPage() {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (profile?.role !== "admin") redirect("/dashboard");

  const [clients, bookings, plans, paid] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("plans").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("bookings").select("amount").in("status", ["confirmed", "completed"]),
  ]);
  const revenue = (paid.data ?? []).reduce((sum, b) => sum + (b.amount ?? 0), 0);

  const stats = [
    { label: "Clients", value: clients.count ?? 0, icon: Users },
    { label: "Bookings", value: bookings.count ?? 0, icon: CalendarDays },
    { label: "Active plans", value: plans.count ?? 0, icon: ClipboardList },
    { label: "Revenue", value: `₹${revenue.toLocaleString("en-IN")}`, icon: IndianRupee },
  ];

  return (
    <DashboardShell name={profile.full_name || "Admin"} badge="Admin">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Admin panel</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Overview</h1>
        <p className="mt-2 text-slate-600">Bookings, availability and client tools arrive on Day 5.</p>
      </Reveal>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={0.08 * i} y={20}>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                  <s.icon size={18} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{s.value}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </DashboardShell>
  );
}

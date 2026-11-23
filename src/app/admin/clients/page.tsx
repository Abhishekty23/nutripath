import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Users } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AdminHeader from "@/components/admin/AdminHeader";
import { requireAdminPage } from "@/lib/admin-guard";
import { fmtIST } from "@/lib/format";

export const instant = false;
export const metadata: Metadata = { title: "Clients | NutriPath Admin" };

type ClientRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  bookings: { status: string }[];
  diet_plans: { id: string }[];
};

export default async function ClientsPage() {
  const { supabase, profile } = await requireAdminPage("/admin/clients");

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at, bookings(status), diet_plans(id)")
    .order("created_at", { ascending: false })
    .returns<ClientRow[]>();

  // Everyone who signed up, plus the admin if they made test bookings
  const clients = (data ?? []).filter((c) => c.role === "user" || c.bookings.length > 0);

  return (
    <DashboardShell name={profile.full_name || "Admin"} badge="Admin">
      <AdminHeader title="Clients" subtitle={`${clients.length} people have signed up.`} />

      <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-slate-500">
            <Users className="text-slate-300" size={36} />
            No clients yet. They appear here when someone signs up.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {clients.map((c) => {
              const paid = c.bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length;
              const needsPlan = paid > 0 && c.diet_plans.length === 0;
              return (
                <li key={c.id}>
                  <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-4 p-5 transition hover:bg-slate-50">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                      {(c.full_name || c.email || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
                        {c.full_name || "Unnamed"}
                        {c.role === "admin" && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">ADMIN</span>}
                        {needsPlan && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                            Needs diet plan
                          </span>
                        )}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {c.email}
                        {c.phone ? ` · ${c.phone}` : ""}
                      </p>
                    </div>
                    <div className="hidden text-right text-sm sm:block">
                      <p className="font-medium text-slate-700">{paid} paid booking{paid === 1 ? "" : "s"}</p>
                      <p className="text-slate-400">Joined {fmtIST(c.created_at, { day: "numeric", month: "short" })}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}

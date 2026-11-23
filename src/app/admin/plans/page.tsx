import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Eye, EyeOff, Pencil, Plus, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatPrice, type PlanRow } from "@/lib/plans";
import DashboardShell from "@/components/dashboard/DashboardShell";
import FormAlert from "@/components/auth/FormAlert";
import { togglePlanActive } from "./actions";

export const instant = false;
export const metadata: Metadata = { title: "Manage plans | NutriPath Admin" };

export default async function AdminPlansPage({ searchParams }: PageProps<"/admin/plans">) {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/plans");
  if (profile?.role !== "admin") redirect("/dashboard");

  const { saved } = await searchParams;
  const { data: plans } = await supabase.from("plans").select("*").order("sort_order").returns<PlanRow[]>();

  return (
    <DashboardShell name={profile.full_name || "Admin"} badge="Admin">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Plans</h1>
          <p className="mt-1 text-slate-600">Changes appear on the website instantly.</p>
        </div>
        <Link
          href="/admin/plans/new"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          <Plus size={18} /> Add plan
        </Link>
      </div>

      {saved && (
        <div className="mt-6">
          <FormAlert type="success" message="Plan saved. The website has been updated." />
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        {(plans ?? []).length === 0 ? (
          <p className="p-10 text-center text-slate-500">No plans yet. Add your first one.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(plans ?? []).map((p) => (
              <li key={p.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{p.title}</p>
                    {p.popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                        <Sparkles size={11} /> Popular
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
                        p.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}
                    >
                      {p.is_active ? "Live" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatPrice(p.price)} · {p.duration} · {p.features.length} features
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={togglePlanActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="make_active" value={String(!p.is_active)} />
                    <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50">
                      {p.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                      {p.is_active ? "Hide" : "Show"}
                    </button>
                  </form>
                  <Link
                    href={`/admin/plans/${p.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                  >
                    <Pencil size={15} /> Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}

import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import type { PlanRow } from "@/lib/plans";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PlanForm from "@/components/admin/PlanForm";

export const instant = false;
export const metadata: Metadata = { title: "Edit plan | NutriPath Admin" };

export default async function EditPlanPage({ params }: PageProps<"/admin/plans/[id]/edit">) {
  const { id } = await params;
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin/plans/${id}/edit`);
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: plan } = await supabase.from("plans").select("*").eq("id", id).maybeSingle<PlanRow>();
  if (!plan) notFound();

  return (
    <DashboardShell name={profile.full_name || "Admin"} badge="Admin">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit plan</h1>
        <p className="mt-1 mb-8 text-slate-600">{plan.title}</p>
        <PlanForm plan={plan} />
      </div>
    </DashboardShell>
  );
}

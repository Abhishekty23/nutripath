import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PlanForm from "@/components/admin/PlanForm";

export const instant = false;
export const metadata: Metadata = { title: "Add plan | NutriPath Admin" };

export default async function NewPlanPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/plans/new");
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <DashboardShell name={profile.full_name || "Admin"} badge="Admin">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add a plan</h1>
        <p className="mt-1 mb-8 text-slate-600">It will appear on the website as soon as you save.</p>
        <PlanForm />
      </div>
    </DashboardShell>
  );
}

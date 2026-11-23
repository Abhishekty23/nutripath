import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ClipboardList, Mail, Phone, Salad, Trash2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AdminHeader from "@/components/admin/AdminHeader";
import ActionButton from "@/components/admin/ActionButton";
import DietPlanForm from "@/components/admin/DietPlanForm";
import { requireAdminPage } from "@/lib/admin-guard";
import { fmtDateTime, fmtIST, rupees, STATUS_STYLE, type BookingStatus } from "@/lib/format";
import { deleteDietPlan } from "../../actions";

export const instant = false;
export const metadata: Metadata = { title: "Client | NutriPath Admin" };

type Booking = {
  id: string;
  status: BookingStatus;
  amount: number;
  plans: { title: string } | null;
  slots: { starts_at: string } | null;
  health_forms: HealthForm | HealthForm[] | null;
};

type HealthForm = {
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  diet_type: string | null;
  allergies: string | null;
  notes: string | null;
};

// One health form per booking, so Supabase may return an object instead of a list
function healthOf(b: Booking): HealthForm | null {
  if (!b.health_forms) return null;
  return Array.isArray(b.health_forms) ? (b.health_forms[0] ?? null) : b.health_forms;
}

type DietPlan = { id: string; title: string; meal_text: string | null; created_at: string };

const DIET_LABEL: Record<string, string> = { veg: "Vegetarian", "non-veg": "Non-vegetarian", vegan: "Vegan", eggetarian: "Eggetarian" };

function bmi(h?: number | null, w?: number | null) {
  if (!h || !w) return null;
  return (w / (h / 100) ** 2).toFixed(1);
}

export default async function ClientDetailPage({ params, searchParams }: PageProps<"/admin/clients/[id]">) {
  const { id } = await params;
  const { supabase, profile: admin } = await requireAdminPage(`/admin/clients/${id}`);
  const sp = await searchParams;
  const msg = typeof sp.msg === "string" ? sp.msg : undefined;

  const [{ data: client }, { data: bookingsData }, { data: plansData }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, phone, created_at").eq("id", id).maybeSingle(),
    supabase
      .from("bookings")
      .select("id, status, amount, plans(title), slots(starts_at), health_forms(age, height_cm, weight_kg, goal, diet_type, allergies, notes)")
      .eq("user_id", id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .returns<Booking[]>(),
    supabase.from("diet_plans").select("id, title, meal_text, created_at").eq("user_id", id).order("created_at", { ascending: false }).returns<DietPlan[]>(),
  ]);
  if (!client) notFound();

  const bookings = bookingsData ?? [];
  const dietPlans = plansData ?? [];
  const latestHealth = bookings.map(healthOf).find(Boolean) ?? null;
  const paidBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");

  return (
    <DashboardShell name={admin.full_name || "Admin"} badge="Admin">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900">
        <ArrowLeft size={16} /> All clients
      </Link>

      <div className="mt-4">
        <AdminHeader title={client.full_name || "Unnamed client"} msg={msg} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left: profile + health */}
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="font-semibold text-slate-900">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2"><Mail size={16} className="text-slate-400" /> {client.email}</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-slate-400" /> {client.phone || "Not given"}</li>
            </ul>
            <p className="mt-4 text-xs text-slate-400">Joined {fmtIST(client.created_at, { day: "numeric", month: "long", year: "numeric" })}</p>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <ClipboardList size={18} className="text-emerald-600" /> Health form
            </h2>
            {latestHealth ? (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Age", latestHealth.age],
                    ["Height", latestHealth.height_cm ? `${latestHealth.height_cm} cm` : null],
                    ["Weight", latestHealth.weight_kg ? `${latestHealth.weight_kg} kg` : null],
                    ["BMI", bmi(latestHealth.height_cm, latestHealth.weight_kg)],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="rounded-xl bg-slate-50 p-3">
                      <dt className="text-xs text-slate-500">{k}</dt>
                      <dd className="font-semibold text-slate-900">{v ?? "-"}</dd>
                    </div>
                  ))}
                </dl>
                <dl className="mt-4 space-y-2 text-sm">
                  <div><dt className="text-slate-500">Goal</dt><dd className="font-medium text-slate-900">{latestHealth.goal || "-"}</dd></div>
                  <div><dt className="text-slate-500">Food preference</dt><dd className="font-medium text-slate-900">{DIET_LABEL[latestHealth.diet_type ?? ""] ?? "-"}</dd></div>
                  <div><dt className="text-slate-500">Allergies</dt><dd className="font-medium text-slate-900">{latestHealth.allergies || "None"}</dd></div>
                  {latestHealth.notes && <div><dt className="text-slate-500">Notes</dt><dd className="whitespace-pre-line text-slate-700">{latestHealth.notes}</dd></div>}
                </dl>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No health form yet. It&apos;s filled in when they book.</p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="font-semibold text-slate-900">Bookings</h2>
            {bookings.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {bookings.map((b) => (
                  <li key={b.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">{b.plans?.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_STYLE[b.status].className}`}>
                        {STATUS_STYLE[b.status].label}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-500">
                      {b.slots ? fmtDateTime(b.slots.starts_at) : "-"} · {rupees(b.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: diet plans */}
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Salad size={20} className="text-emerald-600" /> Write a diet plan
            </h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">Fill in the template below. It appears in the client&apos;s dashboard as soon as you send it.</p>
            <DietPlanForm
              userId={client.id}
              bookings={paidBookings.map((b) => ({
                id: b.id,
                label: `${b.plans?.title ?? "Booking"}${b.slots ? ` · ${fmtIST(b.slots.starts_at, { day: "numeric", month: "short" })}` : ""}`,
              }))}
            />
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Sent diet plans</h2>
            {dietPlans.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Nothing sent yet.</p>
            ) : (
              <ul className="mt-5 space-y-4">
                {dietPlans.map((p) => (
                  <li key={p.id} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">Sent {fmtDateTime(p.created_at)}</p>
                      </div>
                      <form action={deleteDietPlan}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="user_id" value={client.id} />
                        <ActionButton className="!px-2 text-red-600 !ring-red-100 hover:!bg-red-50">
                          <Trash2 size={14} />
                        </ActionButton>
                      </form>
                    </div>
                    {p.meal_text && (
                      <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{p.meal_text}</pre>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

import type { Metadata } from "next";
import { CalendarPlus, Plus, Trash2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AdminHeader from "@/components/admin/AdminHeader";
import ActionButton from "@/components/admin/ActionButton";
import { requireAdminPage } from "@/lib/admin-guard";
import { releaseExpiredHolds } from "@/lib/holds";
import { dayKeyIST, fmtIST } from "@/lib/format";
import { addSlot, deleteSlot, generateSlots } from "../actions";

export const instant = false;
export const metadata: Metadata = { title: "Availability | NutriPath Admin" };

type Slot = { id: string; starts_at: string; is_booked: boolean };

function nowIso() {
  return new Date().toISOString();
}

const input =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15";

export default async function AvailabilityPage({ searchParams }: PageProps<"/admin/availability">) {
  const { supabase, profile } = await requireAdminPage("/admin/availability");
  await releaseExpiredHolds();

  const sp = await searchParams;
  const msg = typeof sp.msg === "string" ? sp.msg : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const { data } = await supabase
    .from("slots")
    .select("id, starts_at, is_booked")
    .gt("starts_at", nowIso())
    .order("starts_at")
    .limit(1000)
    .returns<Slot[]>();
  const slots = data ?? [];

  const days = new Map<string, Slot[]>();
  slots.forEach((s) => {
    const k = dayKeyIST(s.starts_at);
    days.set(k, [...(days.get(k) ?? []), s]);
  });
  const free = slots.filter((s) => !s.is_booked).length;

  return (
    <DashboardShell name={profile.full_name || "Admin"} badge="Admin">
      <AdminHeader
        title="Availability"
        subtitle={`${slots.length} upcoming slots · ${free} free · ${slots.length - free} booked. Times are India time (IST).`}
        msg={msg}
        error={error}
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <form action={generateSlots} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarPlus size={19} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">Add your usual hours</h2>
              <p className="text-sm text-slate-500">Mon–Sat, 10am–1pm & 4pm–7pm, every 30 min</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <select name="days" defaultValue="14" className={`${input} flex-1`}>
              <option value="7">Next 1 week</option>
              <option value="14">Next 2 weeks</option>
              <option value="30">Next 4 weeks</option>
            </select>
            <ActionButton variant="primary">Add slots</ActionButton>
          </div>
          <p className="mt-2 text-xs text-slate-400">Existing slots are skipped, so it&apos;s safe to run again.</p>
        </form>

        <form action={addSlot} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <Plus size={19} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">Add a single slot</h2>
              <p className="text-sm text-slate-500">For an extra appointment outside your usual hours</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <input type="date" name="date" required className={`${input} flex-1`} />
            <input type="time" name="time" required step={1800} className={input} />
            <ActionButton>Add</ActionButton>
          </div>
        </form>
      </div>

      <div className="mt-8 space-y-4">
        {days.size === 0 && (
          <p className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
            No upcoming slots. Use “Add your usual hours” above.
          </p>
        )}
        {[...days.entries()].map(([key, list]) => (
          <section key={key} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-slate-900">
                {fmtIST(list[0].starts_at, { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <span className="text-sm text-slate-500">
                {list.filter((s) => s.is_booked).length} of {list.length} booked
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {list.map((s) =>
                s.is_booked ? (
                  <span
                    key={s.id}
                    title="Booked"
                    className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  >
                    {fmtIST(s.starts_at, { hour: "numeric", minute: "2-digit" })}
                  </span>
                ) : (
                  <form key={s.id} action={deleteSlot} className="group">
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      title="Free · click to remove"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-100"
                    >
                      {fmtIST(s.starts_at, { hour: "numeric", minute: "2-digit" })}
                      <Trash2 size={13} className="opacity-0 transition group-hover:opacity-100" />
                    </button>
                  </form>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-100 ring-1 ring-emerald-200" /> Free (hover to remove)</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-900" /> Booked</span>
      </p>
    </DashboardShell>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarClock, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { releaseExpiredHolds } from "@/lib/holds";
import { dayKeyIST, fmtDateTime, fmtIST } from "@/lib/format";
import DashboardShell from "@/components/dashboard/DashboardShell";
import FormAlert from "@/components/auth/FormAlert";
import ActionButton from "@/components/admin/ActionButton";
import { rescheduleMyBooking } from "../../actions";

export const instant = false;
export const metadata: Metadata = { title: "Reschedule | NutriPath" };

type Booking = {
  id: string;
  status: string;
  reschedule_count: number;
  plans: { title: string } | null;
  slots: { starts_at: string } | null;
};

// Earliest time a booking may be moved to (or moved from): 24 hours from now
function cutoffISO() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

export default async function ReschedulePage({ params, searchParams }: PageProps<"/dashboard/bookings/[id]">) {
  const { id } = await params;
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect(`/login?next=/dashboard/bookings/${id}`);
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : null;

  await releaseExpiredHolds();
  const cutoff = cutoffISO();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, reschedule_count, plans(title), slots(starts_at)")
    .eq("id", id)
    .maybeSingle<Booking>();
  if (!booking) notFound();

  const changeable =
    booking.status === "confirmed" && booking.slots && Date.parse(booking.slots.starts_at) > Date.parse(cutoff) && booking.reschedule_count < 2;

  const { data: slotsData } = changeable
    ? await supabase
        .from("slots")
        .select("id, starts_at")
        .eq("is_booked", false)
        .gt("starts_at", cutoff)
        .order("starts_at")
        .limit(120)
    : { data: [] };

  const byDay = new Map<string, { id: string; starts_at: string }[]>();
  for (const s of slotsData ?? []) {
    const k = dayKeyIST(s.starts_at);
    byDay.set(k, [...(byDay.get(k) ?? []), s]);
  }

  const name = profile?.full_name || user.email?.split("@")[0] || "there";

  return (
    <DashboardShell name={name}>
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-emerald-600">Reschedule</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Pick a new time</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <CalendarClock size={20} />
        </span>
        <div>
          <p className="font-semibold text-slate-900">{booking.plans?.title ?? "Consultation"}</p>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <Clock size={14} /> Currently: {booking.slots ? `${fmtDateTime(booking.slots.starts_at)} IST` : "-"}
          </p>
        </div>
        {changeable && (
          <p className="ml-auto text-xs text-slate-500">
            {2 - booking.reschedule_count} reschedule{2 - booking.reschedule_count === 1 ? "" : "s"} left
          </p>
        )}
      </div>

      {error && (
        <div className="mt-6">
          <FormAlert type="error" message={error} />
        </div>
      )}

      {!changeable ? (
        <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-800 ring-1 ring-amber-100">
          This booking can&apos;t be rescheduled online. Changes are allowed up to 24 hours before the consultation, at most twice.
          Please contact us if you need help.
        </div>
      ) : byDay.size === 0 ? (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">No free times right now. Please check back soon.</div>
      ) : (
        <form action={rescheduleMyBooking} className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <input type="hidden" name="id" value={booking.id} />
          <div className="space-y-6">
            {[...byDay.entries()].map(([k, slots]) => (
              <fieldset key={k}>
                <legend className="text-sm font-semibold text-slate-900">
                  {fmtIST(slots[0].starts_at, { weekday: "long", day: "numeric", month: "long" })}
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {slots.map((s) => (
                    <label key={s.id} className="cursor-pointer">
                      <input type="radio" name="slot_id" value={s.id} required className="peer sr-only" />
                      <span className="block rounded-xl py-2.5 text-center text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:ring-emerald-300 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:ring-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400">
                        {fmtIST(s.starts_at, { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="sticky bottom-4 mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl bg-slate-900 p-4 text-white sm:flex-row sm:items-center">
            <p className="text-sm text-slate-300">All times are India time (IST). Your payment carries over.</p>
            <ActionButton variant="primary" className="!px-5 !py-2.5">Confirm new time</ActionButton>
          </div>
        </form>
      )}
    </DashboardShell>
  );
}

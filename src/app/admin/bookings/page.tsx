import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Check, X } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AdminHeader from "@/components/admin/AdminHeader";
import ActionButton from "@/components/admin/ActionButton";
import { requireAdminPage } from "@/lib/admin-guard";
import { releaseExpiredHolds } from "@/lib/holds";
import { fmtDateTime, rupees, STATUS_STYLE, type BookingStatus } from "@/lib/format";
import { setBookingStatus } from "../actions";

export const instant = false;
export const metadata: Metadata = { title: "Bookings | NutriPath Admin" };

type Row = {
  id: string;
  status: BookingStatus;
  amount: number;
  created_at: string;
  user_id: string;
  plans: { title: string } | null;
  slots: { starts_at: string } | null;
  profiles: { full_name: string | null; email: string | null; phone: string | null } | null;
};

const FILTERS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "pending", label: "Awaiting payment" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
] as const;

// Runs per request (this page is never cached)
function makeIsFuture() {
  const now = Date.now();
  return (r: Row) => !!r.slots && new Date(r.slots.starts_at).getTime() > now;
}

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const { supabase, profile } = await requireAdminPage("/admin/bookings");
  await releaseExpiredHolds();

  const sp = await searchParams;
  const filter = (typeof sp.filter === "string" ? sp.filter : "upcoming") as (typeof FILTERS)[number]["key"];
  const msg = typeof sp.msg === "string" ? sp.msg : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const { data } = await supabase
    .from("bookings")
    .select("id, status, amount, created_at, user_id, plans(title), slots(starts_at), profiles(full_name, email, phone)")
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  const all = data ?? [];
  const isFuture = makeIsFuture();

  const byFilter: Record<string, Row[]> = {
    upcoming: all.filter((b) => b.status === "confirmed" && isFuture(b)),
    past: all.filter((b) => b.status === "completed" || (b.status === "confirmed" && !isFuture(b))),
    pending: all.filter((b) => b.status === "pending"),
    cancelled: all.filter((b) => b.status === "cancelled"),
    all,
  };
  const rows = [...(byFilter[filter] ?? all)].sort((a, b) =>
    filter === "upcoming"
      ? new Date(a.slots?.starts_at ?? 0).getTime() - new Date(b.slots?.starts_at ?? 0).getTime()
      : 0,
  );
  const returnTo = `/admin/bookings?filter=${filter}`;

  return (
    <DashboardShell name={profile.full_name || "Admin"} badge="Admin">
      <AdminHeader title="Bookings" subtitle="Every consultation booked on your website." msg={msg} error={error} />

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/bookings?filter=${f.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
              filter === f.key ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
            }`}
          >
            {f.label} <span className="ml-1 opacity-60">{byFilter[f.key]?.length ?? 0}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-slate-500">
            <CalendarDays className="text-slate-300" size={36} />
            No bookings here yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((b) => {
              const canComplete = b.status === "confirmed";
              const canCancel = b.status === "confirmed" || b.status === "pending";
              return (
                <li key={b.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                      {(b.profiles?.full_name || b.profiles?.email || "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/admin/clients/${b.user_id}`} className="font-semibold text-slate-900 hover:text-emerald-700">
                        {b.profiles?.full_name || "Unnamed client"}
                      </Link>
                      <p className="truncate text-sm text-slate-500">
                        {b.profiles?.email}
                        {b.profiles?.phone ? ` · ${b.profiles.phone}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-medium">{b.plans?.title}</span>
                        {b.slots && <> · {fmtDateTime(b.slots.starts_at)} IST</>} · {rupees(b.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 pl-15 lg:pl-0">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLE[b.status].className}`}>
                      {STATUS_STYLE[b.status].label}
                    </span>
                    {canComplete && (
                      <form action={setBookingStatus}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="status" value="completed" />
                        <input type="hidden" name="return_to" value={returnTo} />
                        <ActionButton>
                          <Check size={15} /> Mark completed
                        </ActionButton>
                      </form>
                    )}
                    {canCancel && (
                      <details className="group relative">
                        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-100 hover:bg-red-50">
                          <X size={15} /> Cancel
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-64 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
                          <p className="text-sm text-slate-600">Cancel this booking and free the slot?</p>
                          {b.status === "confirmed" && (
                            <p className="mt-1 text-xs text-slate-400">Refunds are handled in your Razorpay dashboard.</p>
                          )}
                          <form action={setBookingStatus} className="mt-3">
                            <input type="hidden" name="id" value={b.id} />
                            <input type="hidden" name="status" value="cancelled" />
                            <input type="hidden" name="return_to" value={returnTo} />
                            <ActionButton variant="danger" className="w-full">
                              Yes, cancel booking
                            </ActionButton>
                          </form>
                        </div>
                      </details>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}

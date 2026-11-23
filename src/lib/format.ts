// All consultation times are shown in India time, whatever the viewer's timezone.
export const IST = "Asia/Kolkata";

export function fmtIST(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, ...opts }).format(new Date(iso));
}

export function fmtDateTime(iso: string) {
  return `${fmtIST(iso, { weekday: "short", day: "numeric", month: "short" })} · ${fmtIST(iso, { hour: "numeric", minute: "2-digit" })}`;
}

// "2026-11-25" style key for grouping by day in IST
export function dayKeyIST(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(new Date(iso));
}

export function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export const STATUS_STYLE: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  pending: { label: "Awaiting payment", className: "bg-amber-50 text-amber-700 ring-amber-100" },
  completed: { label: "Completed", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 ring-red-100" },
};

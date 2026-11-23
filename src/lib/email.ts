// Server only: uses the secret key. Never import this from a "use client" file.
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { fmtIST, rupees } from "@/lib/format";

// Emails are sent with Resend (https://resend.com). Without RESEND_API_KEY they are simply skipped.
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "NutriPath <onboarding@resend.dev>";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nutripath-liart.vercel.app";

export type BookingEmailKind = "confirmed" | "rescheduled" | "cancelled";

type BookingInfo = {
  amount: number;
  plans: { title: string } | null;
  slots: { starts_at: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const COPY: Record<BookingEmailKind, { subject: string; heading: string; intro: string }> = {
  confirmed: {
    subject: "Your consultation is confirmed ✅",
    heading: "You're booked in!",
    intro: "Thanks for your payment. Here are the details of your consultation:",
  },
  rescheduled: {
    subject: "Your consultation has a new time",
    heading: "Booking rescheduled",
    intro: "Your consultation has been moved. Here are the new details:",
  },
  cancelled: {
    subject: "Your consultation was cancelled",
    heading: "Booking cancelled",
    intro: "This consultation has been cancelled and the time slot released. Any refund due is processed to your original payment method within 5–7 working days.",
  },
};

function render(kind: BookingEmailKind, b: BookingInfo) {
  const c = COPY[kind];
  const name = esc(b.profiles?.full_name?.split(" ")[0] || "there");
  const when = b.slots
    ? `${fmtIST(b.slots.starts_at, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, ${fmtIST(b.slots.starts_at, { hour: "numeric", minute: "2-digit" })} IST`
    : "-";
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 0;color:#64748b">${k}</td><td style="padding:6px 0;font-weight:600;color:#0f172a;text-align:right">${v}</td></tr>`;

  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px">
    <div style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:#059669;padding:24px 28px;color:#ffffff">
        <div style="font-size:14px;opacity:.85">NutriPath</div>
        <div style="font-size:22px;font-weight:700;margin-top:4px">${c.heading}</div>
      </div>
      <div style="padding:28px">
        <p style="margin:0 0 12px;color:#0f172a">Hi ${name},</p>
        <p style="margin:0 0 20px;color:#334155;line-height:1.5">${c.intro}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${row("Plan", esc(b.plans?.title ?? "Consultation"))}
          ${row("When", when)}
          ${kind === "confirmed" ? row("Paid", rupees(b.amount)) : ""}
        </table>
        <a href="${siteUrl}/dashboard" style="display:inline-block;margin-top:24px;background:#059669;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">Open my dashboard</a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">You can reschedule or cancel up to 24 hours before your consultation from your dashboard.</p>
      </div>
    </div>
  </div></body></html>`;
}

// Never throws: a failed email must not break a booking.
export async function sendBookingEmail(kind: BookingEmailKind, bookingId: string) {
  if (!apiKey || !isAdminClientConfigured) {
    console.info(`[email] skipped "${kind}" email (RESEND_API_KEY not set)`);
    return;
  }
  try {
    const { data: b } = await createAdminClient()
      .from("bookings")
      .select("amount, plans(title), slots(starts_at), profiles(full_name, email)")
      .eq("id", bookingId)
      .maybeSingle<BookingInfo>();
    const to = b?.profiles?.email;
    if (!b || !to) return;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: COPY[kind].subject, html: render(kind, b) }),
    });
    if (!res.ok) console.error(`[email] Resend error ${res.status}:`, await res.text());
  } catch (e) {
    console.error("[email] failed:", e instanceof Error ? e.message : e);
  }
}

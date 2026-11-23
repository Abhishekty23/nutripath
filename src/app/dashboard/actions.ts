"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/server";
import { sendBookingEmail } from "@/lib/email";
import { dayKeyIST } from "@/lib/format";

function back(path: string, params: Record<string, string>): never {
  const url = new URL(path, "http://localhost");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  redirect(`${url.pathname}${url.search}`);
}

// Our database functions raise friendly messages; anything else gets a generic one
function friendly(message: string, fallback: string) {
  return /24 hours|twice|taken|can't be|log in/i.test(message) ? message : fallback;
}

async function requireUser() {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  return { supabase, user };
}

// ---------------- Bookings ----------------

export async function cancelMyBooking(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));

  const { error } = await supabase.rpc("cancel_my_booking", { p_booking: id });
  if (error) back("/dashboard", { error: friendly(error.message, "Could not cancel the booking. Please try again.") });

  after(() => sendBookingEmail("cancelled", id));
  revalidatePath("/admin", "layout");
  back("/dashboard", { msg: "Booking cancelled. Any refund due reaches you in 5–7 working days." });
}

export async function rescheduleMyBooking(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const slotId = String(formData.get("slot_id") || "");
  if (!slotId) back(`/dashboard/bookings/${id}`, { error: "Please choose a new time." });

  const { error } = await supabase.rpc("reschedule_my_booking", { p_booking: id, p_new_slot: slotId });
  if (error) {
    back(`/dashboard/bookings/${id}`, { error: friendly(error.message, "Could not reschedule. Please try again.") });
  }

  after(() => sendBookingEmail("rescheduled", id));
  revalidatePath("/admin", "layout");
  back("/dashboard", { msg: "Booking moved to the new time. We've emailed you the details." });
}

// ---------------- Weight tracker ----------------

export async function logWeight(formData: FormData) {
  const { supabase, user } = await requireUser();
  const weight = Number(formData.get("weight_kg"));
  const today = dayKeyIST(new Date().toISOString());
  const date = String(formData.get("logged_on") || today);

  if (!(weight >= 25 && weight <= 300)) back("/dashboard", { error: "Please enter your weight in kg (25–300)." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) back("/dashboard", { error: "Please choose today or an earlier date." });

  // Logging the same day again replaces that day's entry
  const { error } = await supabase
    .from("progress_logs")
    .upsert({ user_id: user.id, weight_kg: Math.round(weight * 10) / 10, logged_on: date }, { onConflict: "user_id,logged_on" });
  if (error) back("/dashboard", { error: "Could not save your weight. Please try again." });

  revalidatePath("/admin", "layout");
  back("/dashboard", { msg: "Weight saved. Keep it up! 💪" });
}

export async function deleteWeight(formData: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("progress_logs").delete().eq("id", String(formData.get("id")));
  if (error) back("/dashboard", { error: "Could not delete that entry." });
  back("/dashboard", { msg: "Entry deleted." });
}

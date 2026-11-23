"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

// Every admin action re-checks the role on the server (and RLS checks it again in the database).
async function requireAdmin() {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "admin") redirect("/dashboard");
  return supabase;
}

// Go back to the page we came from, adding a ?msg= or ?error= banner (keeps any existing ?filter=)
function back(path: string, params: Record<string, string>): never {
  const url = new URL(path, "http://localhost");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  redirect(`${url.pathname}${url.search}`);
}

// ---------------- Bookings ----------------

export async function setBookingStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const returnTo = String(formData.get("return_to") || "/admin/bookings");
  if (!["completed", "cancelled", "confirmed"].includes(status)) back(returnTo, { error: "Unknown status." });

  const { data: booking } = await supabase.from("bookings").select("id, slot_id, status").eq("id", id).maybeSingle();
  if (!booking) back(returnTo, { error: "Booking not found." });

  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) back(returnTo, { error: "Could not update the booking." });

  // Cancelling frees the time slot so someone else can book it
  if (status === "cancelled" && booking.slot_id) {
    await supabase.from("slots").update({ is_booked: false }).eq("id", booking.slot_id);
  }

  revalidatePath("/admin", "layout");
  back(returnTo, { msg: status === "cancelled" ? "Booking cancelled and slot freed." : "Booking updated." });
}

// ---------------- Availability ----------------

export async function generateSlots(formData: FormData) {
  const supabase = await requireAdmin();
  const days = Math.min(60, Math.max(1, Number(formData.get("days")) || 14));
  const { data, error } = await supabase.rpc("generate_slots", { p_days: days });
  if (error) back("/admin/availability", { error: "Could not create slots." });
  back("/admin/availability", { msg: data ? `${data} new slots added.` : "All those slots already exist." });
}

export async function addSlot(formData: FormData) {
  const supabase = await requireAdmin();
  const date = String(formData.get("date"));
  const time = String(formData.get("time"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    back("/admin/availability", { error: "Please choose a date and time." });
  }

  const startsAt = new Date(`${date}T${time}:00+05:30`); // the time you enter is India time
  if (startsAt.getTime() <= Date.now()) back("/admin/availability", { error: "That time is in the past." });
  const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);

  const { error } = await supabase.from("slots").insert({ starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() });
  if (error?.code === "23505") back("/admin/availability", { error: "A slot already exists at that time." });
  if (error) back("/admin/availability", { error: "Could not add the slot." });
  back("/admin/availability", { msg: "Slot added." });
}

export async function deleteSlot(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const { data, error } = await supabase.from("slots").delete().eq("id", id).eq("is_booked", false).select("id");
  if (error) back("/admin/availability", { error: "This slot has booking history, so it can't be deleted." });
  if (!data?.length) back("/admin/availability", { error: "Booked slots can't be deleted. Cancel the booking first." });
  back("/admin/availability", { msg: "Slot removed." });
}

// ---------------- Diet plans ----------------

export type DietPlanState = { error?: string; ok?: boolean } | null;

export async function addDietPlan(_prev: DietPlanState, formData: FormData): Promise<DietPlanState> {
  const supabase = await requireAdmin();
  const userId = String(formData.get("user_id"));
  const bookingId = String(formData.get("booking_id") || "") || null;
  const title = String(formData.get("title") ?? "").trim() || "Your diet plan";
  const mealText = String(formData.get("meal_text") ?? "").trim();
  if (mealText.length < 20) return { error: "Please write the meal plan (at least a few lines)." };

  const { error } = await supabase.from("diet_plans").insert({
    user_id: userId,
    booking_id: bookingId,
    title: title.slice(0, 120),
    meal_text: mealText.slice(0, 10000),
  });
  if (error) return { error: "Could not save the diet plan." };

  revalidatePath(`/admin/clients/${userId}`);
  return { ok: true };
}

export async function deleteDietPlan(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const userId = String(formData.get("user_id"));
  await supabase.from("diet_plans").delete().eq("id", id);
  back(`/admin/clients/${userId}`, { msg: "Diet plan deleted." });
}

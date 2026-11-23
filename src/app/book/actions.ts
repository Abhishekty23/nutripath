"use server";

import { getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { createRazorpayOrder, isRazorpayConfigured, razorpayKeyId, verifyRazorpaySignature } from "@/lib/razorpay";

export type HealthDetails = {
  age: number;
  heightCm: number;
  weightKg: number;
  goal: string;
  dietType: "veg" | "non-veg" | "vegan" | "eggetarian";
  allergies: string;
  notes: string;
};

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

const DIETS = ["veg", "non-veg", "vegan", "eggetarian"];

// Step 1: reserve the slot and save the health form (held for 15 minutes until paid)
export async function createBooking(planId: string, slotId: string, h: HealthDetails): Promise<Result<{ bookingId: string }>> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to book." };

  if (!(h.age >= 10 && h.age <= 100)) return { ok: false, error: "Please enter a valid age." };
  if (!(h.heightCm >= 100 && h.heightCm <= 250)) return { ok: false, error: "Please enter your height in cm." };
  if (!(h.weightKg >= 25 && h.weightKg <= 300)) return { ok: false, error: "Please enter your weight in kg." };
  if (!h.goal.trim()) return { ok: false, error: "Please tell us your main goal." };
  if (!DIETS.includes(h.dietType)) return { ok: false, error: "Please choose a food preference." };

  const { data, error } = await supabase.rpc("create_booking", {
    p_plan_id: planId,
    p_slot_id: slotId,
    p_age: Math.round(h.age),
    p_height_cm: h.heightCm,
    p_weight_kg: h.weightKg,
    p_goal: h.goal.trim().slice(0, 200),
    p_diet_type: h.dietType,
    p_allergies: h.allergies.slice(0, 500),
    p_notes: h.notes.slice(0, 1000),
  });

  if (error) {
    // Our database function raises friendly messages; anything else gets a generic one
    const friendly = /slot|plan|log in/i.test(error.message) ? error.message : "Could not create the booking. Please try again.";
    return { ok: false, error: friendly };
  }
  return { ok: true, bookingId: data as string };
}

// Step 2: create a Razorpay order for that booking. The amount comes from the database, never the browser.
export async function startPayment(bookingId: string): Promise<Result<{ orderId: string; amount: number; keyId: string }>> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in again." };
  if (!isRazorpayConfigured || !isAdminClientConfigured) {
    return { ok: false, error: "Online payments aren't switched on yet. Your slot is held for 15 minutes." };
  }

  // RLS makes sure users can only read their own booking
  const { data: booking } = await supabase.from("bookings").select("id, status, amount").eq("id", bookingId).maybeSingle();
  if (!booking || booking.status !== "pending") return { ok: false, error: "This booking can no longer be paid for. Please book again." };

  try {
    const order = await createRazorpayOrder(booking.amount, booking.id);
    // .select() returns the updated row, so we can tell if the update really happened
    const { data: updated, error } = await createAdminClient()
      .from("bookings")
      .update({ order_id: order.id })
      .eq("id", booking.id)
      .select("id");
    if (error || !updated?.length) {
      console.error("startPayment: could not save order id. Check SUPABASE_SECRET_KEY.", error?.message);
      return { ok: false, error: "Payments are temporarily unavailable (server setup). Please try again later." };
    }
    return { ok: true, orderId: order.id, amount: order.amount, keyId: razorpayKeyId };
  } catch (e) {
    console.error("startPayment failed:", e instanceof Error ? e.message : e);
    return { ok: false, error: "Could not start the payment. Please try again." };
  }
}

// Step 3: Razorpay sends back a signed receipt. Only a valid signature confirms the booking.
export async function confirmPayment(input: {
  bookingId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<Result<object>> {
  const { user } = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in again." };
  if (!isRazorpayConfigured || !isAdminClientConfigured) return { ok: false, error: "Payments are not configured." };

  if (!verifyRazorpaySignature(input.orderId, input.paymentId, input.signature)) {
    return { ok: false, error: "We couldn't verify this payment. If money was deducted, it will be refunded." };
  }

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, user_id, order_id, status")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (!booking || booking.user_id !== user.id || booking.order_id !== input.orderId) {
    console.error("confirmPayment: booking/order mismatch", { found: Boolean(booking) });
    return { ok: false, error: "We couldn't match this payment to your booking. Please contact us with your payment ID." };
  }
  if (booking.status === "confirmed") return { ok: true };

  // Only a booking that is still held may be confirmed (guards against a late payment after the hold expired)
  const { data: updated, error } = await admin
    .from("bookings")
    .update({ status: "confirmed", payment_id: input.paymentId })
    .eq("id", booking.id)
    .eq("status", "pending")
    .select("id");
  if (error || !updated?.length) {
    return {
      ok: false,
      error: "Your slot hold expired before the payment finished. Please contact us and we'll refund or rebook you.",
    };
  }

  return { ok: true };
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";
import { dayKeyIST } from "@/lib/format";

// One shared demo client, so visitors can explore without signing up.
// example.com never receives mail, and this account has no password: the only way in is this button.
const DEMO_EMAIL = "demo-client@example.com";
const DEMO_NAME = "Riya Sharma (Demo)";

const DIET_PLAN = `Breakfast (8:30 am)
- Vegetable poha with peanuts + 1 cup green tea

Mid-morning (11 am)
- 1 fruit (apple / guava) + 5 almonds

Lunch (1:30 pm)
- 2 multigrain rotis, 1 bowl dal, sabzi, salad, curd

Evening (5 pm)
- Roasted chana or sprouts chaat

Dinner (8 pm)
- Paneer bhurji or grilled tofu with sauteed vegetables

Daily habits
- 2.5–3 litres of water
- 30-minute walk after dinner
- 7–8 hours of sleep`;

// Puts the demo account back to a clean, realistic state on every visit.
async function resetDemoData(userId: string) {
  const admin = createAdminClient();

  await admin.from("profiles").update({ full_name: DEMO_NAME, phone: "+91 90000 00000" }).eq("id", userId);

  // Bookings: free their slots, then remove them
  const { data: old } = await admin.from("bookings").select("id, slot_id, status").eq("user_id", userId);
  const heldSlots = (old ?? []).filter((b) => b.slot_id && b.status !== "cancelled").map((b) => b.slot_id as string);
  if (heldSlots.length) await admin.from("slots").update({ is_booked: false }).in("id", heldSlots);
  await admin.from("diet_plans").delete().eq("user_id", userId);
  await admin.from("bookings").delete().eq("user_id", userId);

  // One confirmed consultation 2+ days from now, so reschedule / cancel can be tried
  const from = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const { data: free } = await admin
    .from("slots")
    .select("id")
    .eq("is_booked", false)
    .gt("starts_at", from)
    .order("starts_at")
    .limit(3);
  const slot = free?.[free.length - 1];
  let bookingId: string | null = null;
  if (slot) {
    const { data: claimed } = await admin.from("slots").update({ is_booked: true }).eq("id", slot.id).eq("is_booked", false).select("id");
    if (claimed?.length) {
      const { data: booking } = await admin
        .from("bookings")
        .insert({ user_id: userId, plan_id: "weight-loss", slot_id: slot.id, status: "confirmed", amount: 1999, payment_id: "demo_payment" })
        .select("id")
        .single();
      bookingId = booking?.id ?? null;
      if (bookingId) {
        await admin.from("health_forms").insert({
          booking_id: bookingId,
          user_id: userId,
          age: 27,
          height_cm: 162,
          weight_kg: 68.4,
          goal: "Lose weight",
          diet_type: "veg",
          allergies: "Lactose (mild)",
          notes: "Desk job, mostly sitting. Want a plan that works with home-cooked food.",
        });
      }
    }
  }

  await admin.from("diet_plans").insert({
    user_id: userId,
    booking_id: bookingId,
    title: "Week 1: Vegetarian weight loss plan (1,400 kcal)",
    meal_text: DIET_PLAN,
  });

  // Six weekly weigh-ins ending today, trending down
  await admin.from("progress_logs").delete().eq("user_id", userId);
  const weights = [68.4, 67.9, 67.6, 67.0, 66.8, 66.1];
  const now = Date.now();
  await admin.from("progress_logs").insert(
    weights.map((w, i) => ({
      user_id: userId,
      weight_kg: w,
      logged_on: dayKeyIST(new Date(now - (weights.length - 1 - i) * 7 * 24 * 60 * 60 * 1000).toISOString()),
    })),
  );
}

export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl;
  if (!isAdminClientConfigured) return NextResponse.redirect(`${origin}/login?error=demo`, 303);

  try {
    const admin = createAdminClient();
    // Creates the demo user the first time, and gives us a one-time login token (no email is sent)
    let { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: DEMO_EMAIL });
    if (error || !data.user) throw error ?? new Error("no user");

    // A brand-new demo user starts unconfirmed: confirm it, then get a fresh login token
    if (!data.user.email_confirmed_at) {
      await admin.auth.admin.updateUserById(data.user.id, { email_confirm: true });
      ({ data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: DEMO_EMAIL }));
      if (error || !data.user) throw error ?? new Error("no user");
    }

    await resetDemoData(data.user.id);

    const supabase = await createClient();
    const { error: otpError } = await supabase.auth.verifyOtp({ type: "email", token_hash: data.properties.hashed_token });
    if (otpError) throw otpError;

    return NextResponse.redirect(`${origin}/dashboard?demo=1`, 303);
  } catch (e) {
    console.error("[demo] login failed:", e instanceof Error ? e.message : e);
    return NextResponse.redirect(`${origin}/login?error=demo`, 303);
  }
}

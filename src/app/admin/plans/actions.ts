"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

export type PlanFormState = { error: string } | null;

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function requireAdmin() {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "admin") return null;
  return supabase;
}

// Create a new plan, or update one when `original_id` is sent.
export async function savePlan(_prev: PlanFormState, formData: FormData): Promise<PlanFormState> {
  const supabase = await requireAdmin();
  if (!supabase) return { error: "Only admins can manage plans." };

  const originalId = String(formData.get("original_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const sortOrder = Number(formData.get("sort_order") || 0);
  const features = String(formData.get("features") ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  if (title.length < 3) return { error: "Please enter a plan name (at least 3 characters)." };
  if (!duration) return { error: "Please enter a duration, e.g. “1 month”." };
  if (!Number.isInteger(price) || price < 0 || price > 1_000_000) return { error: "Price must be a whole number of rupees." };
  if (features.length === 0) return { error: "Add at least one feature (one per line)." };

  const values = {
    title,
    duration,
    description,
    price,
    features,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    popular: formData.get("popular") === "on",
    is_active: formData.get("is_active") === "on",
  };

  if (originalId) {
    const { error } = await supabase.from("plans").update(values).eq("id", originalId);
    if (error) return { error: "Could not save the plan. Please try again." };
  } else {
    const id = slugify(title);
    if (!id) return { error: "Please use letters or numbers in the plan name." };
    const { error } = await supabase.from("plans").insert({ id, ...values });
    if (error?.code === "23505") return { error: "A plan with this name already exists." };
    if (error) return { error: "Could not create the plan. Please try again." };
  }

  updateTag("plans"); // refresh the public plan pages straight away
  redirect("/admin/plans?saved=1");
}

// Show or hide a plan on the website (hiding keeps past bookings intact).
export async function togglePlanActive(formData: FormData) {
  const supabase = await requireAdmin();
  if (!supabase) redirect("/dashboard");

  const id = String(formData.get("id"));
  const makeActive = formData.get("make_active") === "true";
  await supabase.from("plans").update({ is_active: makeActive }).eq("id", id);

  updateTag("plans");
  redirect("/admin/plans");
}

import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { plans as fallbackPlans, type Plan } from "@/lib/data";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";

export type { Plan };

export type PlanRow = {
  id: string;
  title: string;
  description: string | null;
  duration: string;
  price: number;
  features: string[];
  popular: boolean;
  is_active: boolean;
  sort_order: number;
};

export function rowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    duration: row.duration,
    price: row.price,
    features: row.features ?? [],
    popular: row.popular,
  };
}

// Public list of active plans. Cached, and refreshed instantly when an admin edits a plan.
export async function getPlans(): Promise<Plan[]> {
  "use cache";
  cacheTag("plans");
  cacheLife("hours");

  if (!isSupabaseConfigured) return fallbackPlans;
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .returns<PlanRow[]>();
    if (error || !data?.length) return fallbackPlans;
    return data.map(rowToPlan);
  } catch {
    // Database unreachable (e.g. local build without network): show the built-in plans.
    return fallbackPlans;
  }
}

export async function getPlan(id: string): Promise<Plan | undefined> {
  const all = await getPlans();
  return all.find((p) => p.id === id);
}

export function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

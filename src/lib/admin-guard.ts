import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

// For admin pages: returns the Supabase client and profile, or sends non-admins away.
export async function requireAdminPage(path: string) {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);
  if (profile?.role !== "admin") redirect("/dashboard");
  return { supabase, profile };
}

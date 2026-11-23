import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

// Supabase client for Server Components, Server Actions and Route Handlers.
export async function createClient() {
  const cookieStore = await cookies();

  // Placeholder values keep the client from throwing when keys are missing; getCurrentUser checks first.
  return createServerClient(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder", {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: safe to ignore, the proxy refreshes sessions.
        }
      },
    },
  });
}

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
};

// Returns the logged-in user and their profile, or nulls if logged out.
export async function getCurrentUser() {
  const supabase = await createClient();
  if (!isSupabaseConfigured) return { supabase, user: null, profile: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  return { supabase, user, profile };
}

import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

// Server-only client with full access (bypasses Row Level Security).
// Used ONLY after we have verified something ourselves, e.g. a Razorpay payment signature.
const secretKey = process.env.SUPABASE_SECRET_KEY ?? "";

export const isAdminClientConfigured = Boolean(supabaseUrl && secretKey);

export function createAdminClient() {
  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

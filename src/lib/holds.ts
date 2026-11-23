import { createAdminClient, isAdminClientConfigured } from "@/lib/supabase/admin";

// Unpaid bookings hold a slot for 15 minutes. This frees any that have expired.
// Called when admin pages and the booking page load, so stale holds never block slots for long.
export async function releaseExpiredHolds() {
  if (!isAdminClientConfigured) return;
  try {
    await createAdminClient().rpc("release_expired_holds");
  } catch {
    // Non-critical: the next booking attempt also releases expired holds.
  }
}

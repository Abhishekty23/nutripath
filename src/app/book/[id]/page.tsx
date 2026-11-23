import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import BookingWizard from "@/components/booking/BookingWizard";
import { getPlan } from "@/lib/plans";
import { getCurrentUser } from "@/lib/supabase/server";
import { releaseExpiredHolds } from "@/lib/holds";

// Depends on who is logged in, so it renders on every request.
export const instant = false;
export const metadata: Metadata = { title: "Book a consultation | NutriPath" };

export default async function BookPage({ params }: PageProps<"/book/[id]">) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) notFound();

  const { user, profile } = await getCurrentUser();
  if (!user) redirect(`/login?next=/book/${id}`);
  await releaseExpiredHolds(); // free slots from unpaid bookings older than 15 minutes

  const customer = {
    name: profile?.full_name || user.email?.split("@")[0] || "",
    email: user.email ?? "",
    phone: profile?.phone ?? "",
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50 px-5 pb-24 pt-32">
        <div className="mx-auto max-w-6xl">
          <Link href={`/plans/${plan.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900">
            <ArrowLeft size={16} /> Back to plan
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Book your consultation</h1>
          <p className="mt-2 mb-10 text-slate-600">Three quick steps and you&apos;re done.</p>
          <BookingWizard plan={plan} customer={customer} />
        </div>
      </main>
    </>
  );
}

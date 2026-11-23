import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarClock } from "lucide-react";
import Navbar from "@/components/home/Navbar";
import { formatPrice, getPlan, getPlans } from "@/lib/plans";

// Temporary page: the full booking flow (slots, health form, payment) arrives on Day 4.
export async function generateStaticParams() {
  const plans = await getPlans();
  return plans.map((p) => ({ id: p.id }));
}

export const metadata: Metadata = { title: "Book a consultation | NutriPath" };

export default async function BookPage({ params }: PageProps<"/book/[id]">) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) notFound();

  return (
    <>
      <Navbar />
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-emerald-50 to-white px-5 pt-24">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-100">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CalendarClock size={30} />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-emerald-600">{plan.title}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Online booking opens soon</h1>
          <p className="mt-3 text-slate-600">
            You&apos;ll soon be able to pick a time slot and pay {formatPrice(plan.price)} securely right here. Create an
            account now so you&apos;re ready.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup" className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">
              Create account
            </Link>
            <Link
              href={`/plans/${plan.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-3 font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft size={16} /> Back to plan
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

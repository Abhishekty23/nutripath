import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import PlanCard from "@/components/plans/PlanCard";
import SectionHeading from "@/components/ui/SectionHeading";
import FAQ from "@/components/home/FAQ";
import { getPlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Plans & pricing | NutriPath",
  description: "Compare NutriPath nutrition plans: single consultations, weight loss, muscle gain and 3-month wellness programmes.",
};

export default async function PlansPage() {
  const plans = await getPlans();

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-slate-50 pb-24 pt-36">
          <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-5">
            <SectionHeading
              eyebrow="Plans & pricing"
              title={
                <>
                  Choose the plan that <span className="text-emerald-600">fits your goal</span>
                </>
              }
              subtitle="Every plan includes a personalised meal plan and 1-on-1 video consultations."
            />
            <div className={`mt-16 grid gap-6 sm:grid-cols-2 ${plans.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {plans.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} index={i} />
              ))}
            </div>
          </div>
        </section>
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

import type { Plan } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import PlanCard from "@/components/plans/PlanCard";

export default function Plans({ plans }: { plans: Plan[] }) {
  return (
    <section id="plans" className="relative scroll-mt-24 overflow-hidden bg-slate-50 py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Plans & pricing"
          title="Pick the plan that fits your goal"
          subtitle="Simple, transparent pricing. No hidden charges."
        />

        <div className={`mt-16 grid gap-6 sm:grid-cols-2 ${plans.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

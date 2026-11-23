"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { savePlan, type PlanFormState } from "@/app/admin/plans/actions";
import FormAlert from "@/components/auth/FormAlert";
import type { PlanRow } from "@/lib/plans";

const input =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15";

export default function PlanForm({ plan }: { plan?: PlanRow }) {
  const [state, action, pending] = useActionState<PlanFormState, FormData>(savePlan, null);

  return (
    <form action={action} className="space-y-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
      <FormAlert message={state?.error ?? null} />
      {plan && <input type="hidden" name="original_id" value={plan.id} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Plan name</span>
          <input name="title" defaultValue={plan?.title} required minLength={3} placeholder="e.g. PCOS Support Plan" className={input} />
          {!plan && <span className="mt-1 block text-xs text-slate-400">The web address is created from the name.</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Duration</span>
          <input name="duration" defaultValue={plan?.duration} required placeholder="e.g. 1 month" className={input} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Price (₹)</span>
          <input name="price" type="number" min={0} step={1} defaultValue={plan?.price} required placeholder="1999" className={input} />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Short description</span>
          <input name="description" defaultValue={plan?.description ?? ""} placeholder="One sentence shown on the plan card" className={input} />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Features (one per line)</span>
          <textarea
            name="features"
            rows={5}
            required
            defaultValue={plan?.features.join("\n")}
            placeholder={"2 consultations\nCustom weekly meal plan\nWhatsApp support"}
            className={input}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Display order</span>
          <input name="sort_order" type="number" defaultValue={plan?.sort_order ?? 10} className={input} />
          <span className="mt-1 block text-xs text-slate-400">Lower numbers show first.</span>
        </label>

        <div className="space-y-3 pt-7">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="is_active" defaultChecked={plan?.is_active ?? true} className="h-5 w-5 accent-emerald-600" />
            Show on website
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="popular" defaultChecked={plan?.popular ?? false} className="h-5 w-5 accent-emerald-600" />
            Mark as “Most popular”
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <Link href="/admin/plans" className="rounded-xl px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-70"
        >
          {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {plan ? "Save changes" : "Create plan"}
        </button>
      </div>
    </form>
  );
}

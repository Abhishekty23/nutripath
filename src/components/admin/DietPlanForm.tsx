"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { addDietPlan, type DietPlanState } from "@/app/admin/actions";
import FormAlert from "@/components/auth/FormAlert";

const TEMPLATE = `Breakfast (8:00 am)
-

Mid-morning (11:00 am)
-

Lunch (1:30 pm)
-

Evening snack (5:00 pm)
-

Dinner (8:00 pm)
-

Notes
- Drink 2.5–3 litres of water a day
- `;

const input =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15";

export default function DietPlanForm({
  userId,
  bookings,
}: {
  userId: string;
  bookings: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState<DietPlanState, FormData>(addDietPlan, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <FormAlert type={state?.ok ? "success" : "error"} message={state?.ok ? "Diet plan sent. The client can see it in their dashboard." : state?.error ?? null} />
      <input type="hidden" name="user_id" value={userId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input name="title" placeholder="Week 1 meal plan" className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">For booking</span>
          <select name="booking_id" className={input} defaultValue={bookings[0]?.id ?? ""}>
            <option value="">Not linked</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Meal plan</span>
        <textarea name="meal_text" rows={14} defaultValue={TEMPLATE} className={`${input} font-mono text-sm leading-relaxed`} />
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-70"
        >
          {pending ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
          Send diet plan
        </button>
      </div>
    </form>
  );
}

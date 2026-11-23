import { Scale, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import ActionButton from "@/components/admin/ActionButton";
import WeightChart, { type WeightPoint } from "./WeightChart";
import { deleteWeight, logWeight } from "@/app/dashboard/actions";

export type ProgressLog = { id: string; weight_kg: number; logged_on: string };

const day = (d: string) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(new Date(`${d}T00:00:00Z`));

// Weight tracker: log form, summary, chart and the full list (the list doubles as the chart's table view).
// `readOnly` is used on the admin client page.
export default function WeightTracker({ logs, today, readOnly = false }: { logs: ProgressLog[]; today: string; readOnly?: boolean }) {
  const sorted = [...logs].sort((a, b) => a.logged_on.localeCompare(b.logged_on));
  const points: WeightPoint[] = sorted.map((l) => ({ date: l.logged_on, weight: Number(l.weight_kg) }));
  const first = points[0]?.weight;
  const last = points[points.length - 1]?.weight;
  const change = first !== undefined && last !== undefined ? Math.round((last - first) * 10) / 10 : null;

  return (
    <div>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            ["Start", first !== undefined ? `${first} kg` : "-"],
            ["Latest", last !== undefined ? `${last} kg` : "-"],
            ["Change", change === null || points.length < 2 ? "-" : `${change > 0 ? "+" : ""}${change} kg`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{k}</p>
              <p className="flex items-center gap-1 font-semibold text-slate-900">
                {k === "Change" && change !== null && points.length >= 2 && change !== 0 &&
                  (change < 0 ? <TrendingDown size={15} className="text-emerald-600" /> : <TrendingUp size={15} className="text-amber-600" />)}
                {v}
              </p>
            </div>
          ))}
        </div>

        {!readOnly && (
          <form action={logWeight} className="flex flex-wrap items-end gap-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-500">Weight (kg)</span>
              <input
                name="weight_kg"
                type="number"
                step="0.1"
                min="25"
                max="300"
                required
                placeholder={last ? String(last) : "e.g. 72.5"}
                className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-slate-500">Date</span>
              <input
                name="logged_on"
                type="date"
                defaultValue={today}
                max={today}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <ActionButton variant="primary" className="!py-2.5">
              <Scale size={15} /> Log weight
            </ActionButton>
          </form>
        )}
      </div>

      <div className="mt-6">
        <WeightChart points={points} />
      </div>

      {sorted.length > 0 && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium text-emerald-700">All entries ({sorted.length})</summary>
          <ul className="mt-3 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-100">
            {[...sorted].reverse().map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-2">
                <span className="text-slate-600">{day(l.logged_on)}</span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">{Number(l.weight_kg)} kg</span>
                  {!readOnly && (
                    <form action={deleteWeight}>
                      <input type="hidden" name="id" value={l.id} />
                      <ActionButton className="!px-2 !py-1 text-red-600 !ring-red-100 hover:!bg-red-50">
                        <Trash2 size={13} />
                        <span className="sr-only">Delete entry</span>
                      </ActionButton>
                    </form>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

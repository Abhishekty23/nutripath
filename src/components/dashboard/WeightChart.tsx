"use client";

import { useState } from "react";

export type WeightPoint = { date: string; weight: number }; // date = "YYYY-MM-DD"

const W = 640;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

const label = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...opts }).format(new Date(`${d}T00:00:00Z`));

// Simple single-series line chart: thin line, round markers, crosshair + tooltip on hover.
export default function WeightChart({ points, goal }: { points: WeightPoint[]; goal?: number | null }) {
  const [active, setActive] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="grid h-48 place-items-center rounded-2xl bg-slate-50 text-center text-sm text-slate-500">
        <p>Log your weight on at least 2 days to see your progress chart.</p>
      </div>
    );
  }

  const values = points.map((p) => p.weight).concat(goal ? [goal] : []);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  const t0 = Date.parse(points[0].date);
  const t1 = Date.parse(points[points.length - 1].date);

  const x = (d: string) => PAD.left + ((Date.parse(d) - t0) / Math.max(1, t1 - t0)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + ((max - v) / (max - min)) * (H - PAD.top - PAD.bottom);

  const step = Math.max(1, Math.round((max - min) / 4));
  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) ticks.push(v);

  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.weight).toFixed(1)}`).join(" ");
  const xLabels = points.length <= 6 ? points : [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]];
  const a = active !== null ? points[active] : null;

  // Nearest point to the pointer
  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * (W - PAD.left - PAD.right) + PAD.left;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(x(p.date) - px) < Math.abs(x(points[best].date) - px)) best = i;
    });
    setActive(best);
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Weight over time chart">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{t}</text>
          </g>
        ))}
        {xLabels.map((p) => (
          <text key={p.date} x={x(p.date)} y={H - 8} textAnchor="middle" className="fill-slate-400 text-[11px]">
            {label(p.date, { day: "numeric", month: "short" })}
          </text>
        ))}

        {goal ? (
          <g>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(goal)} y2={y(goal)} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" />
            <text x={W - PAD.right} y={y(goal) - 6} textAnchor="end" className="fill-slate-500 text-[11px] font-medium">Goal {goal} kg</text>
          </g>
        ) : null}

        <path d={path} fill="none" stroke="#059669" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={p.date} cx={x(p.date)} cy={y(p.weight)} r={active === i ? 6 : 4.5} fill="#059669" stroke="#fff" strokeWidth={2} />
        ))}

        {a && (
          <line x1={x(a.date)} x2={x(a.date)} y1={PAD.top} y2={H - PAD.bottom} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
        )}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={W - PAD.left - PAD.right}
          height={H - PAD.top - PAD.bottom}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        />
      </svg>

      {a && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg"
          style={{ left: `${(x(a.date) / W) * 100}%` }}
        >
          <span className="font-semibold">{a.weight} kg</span>
          <span className="ml-1.5 text-slate-300">{label(a.date, { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      )}
    </div>
  );
}

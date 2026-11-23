import { Leaf } from "lucide-react";

// Shown instantly while a logged-in page loads, so clicks feel immediate.
export default function PageSkeleton({ cards = 3, rows = 4 }: { cards?: number; rows?: number }) {
  const bar = "animate-pulse rounded-lg bg-slate-200/70";
  return (
    <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Loading">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="flex items-center gap-2 font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white">
              <Leaf size={16} />
            </span>
            NutriPath
          </span>
          <span className={`${bar} h-8 w-32 rounded-full`} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className={`${bar} h-4 w-28`} />
        <div className={`${bar} mt-3 h-9 w-64`} />
        <div className={`${bar} mt-3 h-4 w-80 max-w-full`} />
        <div className={`mt-8 grid gap-5 ${cards >= 4 ? "sm:grid-cols-4" : cards === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className={`${bar} h-4 w-24`} />
              <div className={`${bar} mt-4 h-8 w-16`} />
              <div className={`${bar} mt-3 h-3 w-32`} />
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className={`${bar} h-6 w-48`} />
          <div className="mt-6 space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`${bar} h-12 w-12 rounded-2xl`} />
                <div className="flex-1 space-y-2">
                  <div className={`${bar} h-4 w-1/3`} />
                  <div className={`${bar} h-3 w-1/2`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

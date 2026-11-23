"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

// One-click demo: posts to /auth/demo, which signs the visitor in as the shared demo client.
export default function DemoLogin() {
  const [loading, setLoading] = useState(false);
  return (
    <form action="/auth/demo" method="post" onSubmit={() => setLoading(true)} className="mt-8">
      <div className="relative flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-100 disabled:opacity-60"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {loading ? "Setting up the demo…" : "Try the demo, no signup needed"}
      </button>
      <p className="mt-2 text-center text-xs text-slate-500">
        Explore as a sample client with a booking, diet plan and progress chart.
      </p>
    </form>
  );
}

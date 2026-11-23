import { ArrowRight, Loader2 } from "lucide-react";

export default function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          {children}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}

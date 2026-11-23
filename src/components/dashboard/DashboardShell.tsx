import Link from "next/link";
import { Leaf, LogOut } from "lucide-react";
import { signOut } from "@/app/auth/actions";

// Top bar + container for logged-in pages (user dashboard and admin).
export default function DashboardShell({
  name,
  badge,
  children,
}: {
  name: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Leaf size={17} />
            </span>
            NutriPath
            {badge && (
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">{badge}</span>
            )}
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm font-medium text-slate-700 sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                {name.charAt(0).toUpperCase()}
              </span>
              {name}
            </span>
            <form action={signOut}>
              <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                <LogOut size={16} /> Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}

"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

// Submit button for server-action forms: shows a spinner and blocks double clicks.
export default function ActionButton({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  const styles = {
    default: "text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${styles} ${className}`}
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

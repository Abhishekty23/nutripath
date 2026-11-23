import FormAlert from "@/components/auth/FormAlert";

// Page title + optional success/error banner (from ?msg= or ?error= after an action).
export default function AdminHeader({
  title,
  subtitle,
  msg,
  error,
  action,
}: {
  title: string;
  subtitle?: string;
  msg?: string;
  error?: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
        </div>
        {action}
      </div>
      {(msg || error) && (
        <div className="mt-6">
          <FormAlert type={error ? "error" : "success"} message={error ?? msg ?? null} />
        </div>
      )}
    </>
  );
}

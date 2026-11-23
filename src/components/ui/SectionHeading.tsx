import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest ${
          light ? "bg-white/10 text-emerald-300 ring-1 ring-white/15" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${light ? "bg-emerald-300" : "bg-emerald-500"}`} />
        {eyebrow}
      </span>
      <h2
        className={`mt-5 text-3xl font-bold tracking-tight md:text-5xl ${light ? "text-white" : "text-slate-900"}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg ${light ? "text-emerald-100/80" : "text-slate-600"}`}>{subtitle}</p>
      )}
    </Reveal>
  );
}

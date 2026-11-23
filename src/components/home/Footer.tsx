import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import { navLinks, site } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2.5 text-xl font-bold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Leaf size={19} />
            </span>
            {site.name}
          </p>
          <p className="mt-5 max-w-xs leading-relaxed">
            Personalised nutrition plans and online consultations to help you eat better and feel your best.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white">Quick links</p>
          <ul className="mt-5 space-y-3">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-emerald-400">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white">Contact</p>
          <ul className="mt-5 space-y-3">
            <li className="flex items-center gap-3"><Mail size={16} className="text-emerald-500" /> {site.email}</li>
            <li className="flex items-center gap-3"><Phone size={16} className="text-emerald-500" /> {site.phone}</li>
            <li className="flex items-center gap-3"><MapPin size={16} className="text-emerald-500" /> Online, worldwide</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 px-5 py-6 text-center text-xs text-slate-500">
        © 2026 {site.name}. Demo project built for portfolio purposes, not a real medical service. Content is general
        wellness information, not medical advice.
      </div>
    </footer>
  );
}

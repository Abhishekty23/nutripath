"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CalendarDays, ClipboardList, LayoutDashboard, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/availability", label: "Availability", icon: CalendarClock },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/plans", label: "Plans", icon: ClipboardList },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${
              active ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <l.icon size={16} /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

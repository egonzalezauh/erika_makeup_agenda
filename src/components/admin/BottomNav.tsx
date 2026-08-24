"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Plus, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin",        label: "Hoy",     Icon: Sun },
  { href: "/admin/nueva",  label: "Agendar", Icon: Plus },
  { href: "/admin/agenda", label: "Agenda",  Icon: CalendarDays },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-cream-deep bg-cream-soft/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex w-full max-w-lg">
        {TABS.map(({ href, label, Icon }) => {
          const isActive =
            href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  // h-16: objetivo táctil cómodo, muy por encima del mínimo de 44px
                  "flex h-16 flex-col items-center justify-center gap-1 transition-colors",
                  isActive ? "text-muted-rose" : "text-charcoal-light"
                )}
              >
                <Icon size={22} strokeWidth={1.6} aria-hidden />
                <span className="font-sans text-[0.65rem] tracking-[0.14em] uppercase">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

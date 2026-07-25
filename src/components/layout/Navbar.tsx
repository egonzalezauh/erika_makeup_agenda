import Link from "next/link";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#galeria",   label: "Galería"   },
  { href: "/calendario", label: "Calendario" },
  { href: "#contacto",  label: "Contacto"  },
] as const;

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-cream-soft/85 backdrop-blur-md border-b border-cream-deep/40">
      <nav className="flex items-center justify-between h-16 px-6 md:px-14 max-w-[1440px] mx-auto">

        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-lg tracking-[0.25em] uppercase text-dark-charcoal select-none hover:text-muted-rose transition-colors duration-300"
        >
          Erika Auhing
        </Link>

        {/* Nav links — hidden on mobile */}
        <ul className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-[10px] tracking-[0.22em] uppercase text-charcoal-mid hover:text-muted-rose transition-colors duration-200 font-sans"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/booking"
          className="text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 border border-dark-charcoal/70 text-dark-charcoal hover:bg-dark-charcoal hover:text-cream-soft transition-all duration-300 font-sans"
        >
          Agendar
        </Link>
      </nav>
    </header>
  );
}

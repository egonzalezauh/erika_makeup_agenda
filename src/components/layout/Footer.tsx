import Link from "next/link";
import { Globe, Phone } from "lucide-react";

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/erikaauhingmakeup",
    label: "Instagram",
    icon: Globe,
    external: true,
  },
  {
    href: "https://wa.me/593999119408",
    label: "WhatsApp",
    icon: Phone,
    external: true,
  },
] as const;

export function Footer() {
  return (
    <footer
      id="contacto"
      className="bg-dark-charcoal text-cream-soft py-20 md:py-28 px-6 md:px-14"
    >
      <div className="max-w-[2200px] mx-auto">

        {/* ─── Marca central ────────────────────────────── */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[9px] tracking-[0.42em] uppercase text-cream-soft/35 font-sans mb-4">
            Maquillaje Profesional
          </p>
          <h2 className="font-serif text-[clamp(3rem,7vw,6rem)] font-light leading-none tracking-tight text-cream-soft">
            Erika Auhing
          </h2>
          <div className="w-10 h-px bg-gold-accent mx-auto mt-6" />
        </div>

        {/* ─── Frase editorial ──────────────────────────── */}
        <p className="text-center font-serif italic text-lg text-cream-soft/55 mb-14 max-w-sm mx-auto leading-relaxed">
          &ldquo;Maquillaje profesional de alta gama para momentos que merecen ser recordados.&rdquo;
        </p>

        {/* ─── Redes sociales ───────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-14 md:mb-16">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon, external }, i) => (
            <div key={href} className="flex items-center gap-5 md:gap-8">
              {i > 0 && (
                <span className="hidden md:block w-px h-4 bg-cream-soft/15" />
              )}
              <a
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex items-center gap-2.5 group text-[10px] tracking-[0.22em] uppercase text-cream-soft/45 hover:text-cream-soft transition-colors duration-200 font-sans"
              >
                <Icon
                  size={15}
                  className="text-cream-soft/35 group-hover:text-gold-accent transition-colors duration-200 shrink-0"
                />
                {label}
              </a>
            </div>
          ))}
        </div>

        {/* ─── CTA en footer ────────────────────────────── */}
        <div className="flex justify-center mb-16">
          <Link
            href="/booking"
            className="border border-cream-soft/25 text-cream-soft/70 text-[10px] tracking-[0.28em] uppercase px-10 py-4 hover:border-cream-soft/60 hover:text-cream-soft hover:bg-cream-soft/5 transition-all duration-300 font-sans"
          >
            Reservar Cita
          </Link>
        </div>

        {/* ─── Línea inferior ───────────────────────────── */}
        <div className="border-t border-cream-soft/10 pt-7 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] tracking-[0.18em] uppercase text-cream-soft/22 font-sans">
            © 2026 Erika Auhing Makeup · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-6">
            <p className="text-[10px] tracking-[0.18em] uppercase text-cream-soft/22 font-sans">
              Guayaquil, Ecuador
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

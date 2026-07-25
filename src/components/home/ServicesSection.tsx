import Link from "next/link";
import { getServices } from "@/actions/appointments";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hora${h > 1 ? "s" : ""}` : `${h}h ${m} min`;
}

export async function ServicesSection() {
  const services = await getServices();

  const numbers = ["01", "02", "03", "04", "05"];

  return (
    <section id="servicios" className="py-24 md:py-36 px-6 md:px-14 bg-cream-soft">
      <div className="max-w-[1440px] mx-auto">

        {/* Encabezado */}
        <div className="flex items-end justify-between border-b border-cream-deep pb-8 mb-16 md:mb-20">
          <div>
            <span className="block text-sm tracking-[0.25em] uppercase text-charcoal-light font-sans mb-3">
              — Lo que ofrezco
            </span>
            <h2 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] font-light text-dark-charcoal leading-tight">
              Servicios
            </h2>
          </div>
          <Link
            href="/booking"
            className="hidden md:flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-charcoal-light hover:text-muted-rose transition-colors duration-200 font-sans"
          >
            Agendar cita
            <span className="block w-7 h-px bg-current" />
          </Link>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-cream-deep">
          {services.map((svc, i) => (
            <div
              key={svc.id}
              className="pt-10 pb-10 md:pt-0 md:pb-0 md:px-10 lg:px-14 first:pl-0 last:pr-0 group"
            >
              {/* Número editorial */}
              <span className="block font-serif text-[3.8rem] leading-none font-bold text-charcoal-light/40 group-hover:text-muted-rose transition-colors duration-500 mb-5 select-none">
                {numbers[i] ?? `0${i + 1}`}
              </span>

              {/* Nombre del servicio */}
              <h3 className="font-serif text-[clamp(1.5rem,2.5vw,2rem)] font-light text-dark-charcoal leading-[1.1] mb-4 group-hover:text-muted-rose transition-colors duration-300">
                {svc.name}
              </h3>

              {/* Línea dorada */}
              <div className="w-8 h-px bg-gold-accent mb-6 group-hover:w-12 transition-all duration-500" />

              {/* Descripción */}
              <p className="font-sans text-base leading-relaxed text-charcoal-light mb-10">
                {svc.description}
              </p>

              {/* Detalles + CTA */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm tracking-[0.15em] uppercase text-charcoal-light font-sans">
                    {formatDuration(svc.duration)}
                  </p>
                </div>
                <Link
                  href="/booking"
                  className="text-sm tracking-[0.1em] uppercase text-charcoal-light border-b border-charcoal-light/30 pb-px hover:text-muted-rose hover:border-muted-rose transition-colors duration-200 font-sans"
                >
                  Agendar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

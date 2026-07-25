import Link from "next/link";
import Image from "next/image";

const STATS = [
  { value: "500+", label: "Looks\nrealizados" },
] as const;

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex overflow-hidden bg-cream-soft">

      {/* ─── Contenido izquierdo ──────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center pt-20 pb-16 px-6 md:px-14 lg:px-24 w-full md:w-[54%] lg:w-[50%]">

        {/* Etiqueta superior */}
        <div className="flex items-center gap-3 mb-10 md:mb-14">
          <span className="block w-10 h-px bg-gold-accent shrink-0" />
          <span className="text-[9px] tracking-[0.35em] uppercase text-charcoal-light font-sans">
            Maquillaje Profesional · Guayaquil
          </span>
        </div>

        {/* Titular principal */}
        <h1 className="font-serif font-light text-dark-charcoal leading-[0.92] tracking-tight mb-6 md:mb-8 select-none">
          <span className="block text-[clamp(4rem,9vw,7.5rem)]">Resalta</span>
          <span className="block text-[clamp(4rem,9vw,7.5rem)] italic">tu</span>
          <span className="block text-[clamp(4rem,9vw,7.5rem)]">esencia.</span>
        </h1>

        {/* Línea dorada decorativa */}
        <div className="w-14 h-px bg-gold-accent mb-8 md:mb-10" />

        {/* Subtexto */}
        <p className="font-sans text-[13px] leading-[1.9] text-charcoal-light max-w-[300px] mb-10 md:mb-14">
          Transformamos tu mirada con técnicas de maquillaje profesional diseñadas
          para cada momento especial de tu vida.
        </p>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-6 mb-14 md:mb-20">
          <Link
            href="/booking"
            className="inline-flex items-center gap-3 bg-dark-charcoal text-cream-soft px-8 py-4 text-[10px] tracking-[0.25em] uppercase hover:bg-muted-rose transition-colors duration-300 group font-sans"
          >
            Agendar Cita
            <span className="block w-4 h-px bg-cream-soft/50 group-hover:w-7 transition-all duration-300" />
          </Link>
          <Link
            href="#servicios"
            className="text-[10px] tracking-[0.2em] uppercase text-charcoal-mid border-b border-charcoal-mid/30 pb-px hover:text-muted-rose hover:border-muted-rose transition-colors duration-200 font-sans"
          >
            Explorar servicios
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="flex gap-10">
          {STATS.map(({ value, label }) => (
            <div key={value} className="flex items-baseline gap-3">
              <span className="font-serif text-[2.4rem] font-light text-dark-charcoal leading-none">
                {value}
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-charcoal-light leading-[1.6] whitespace-pre-line font-sans">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Imagen derecha (desktop) ─────────────────────── */}
      <div className="hidden md:block absolute right-0 top-0 h-full w-[38%] lg:w-[40%]">
        <div className="relative h-full translate-y-6">

          {/* Contenedor imagen principal */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/images/novia_mirando_arriba.jpeg"
              alt="Maquillaje de novia profesional"
              fill
              unoptimized
              className="object-cover"
              style={{ objectPosition: "center 15%" }}
              priority
            />
            {/* Overlay sutil para que el badge sea legible */}
            <div className="absolute inset-0 bg-gradient-to-r from-cream-soft/20 to-transparent" />

            {/* Franja inferior decorativa */}
            <div className="absolute bottom-0 left-0 right-24 h-px bg-gold-accent/25" />

            {/* Badge flotante */}
            <div className="absolute bottom-12 left-10 bg-cream-soft/92 backdrop-blur-sm p-5 max-w-[190px] shadow-[0_2px_20px_rgba(26,22,20,0.08)]">
              <p className="text-[9px] tracking-[0.3em] uppercase text-charcoal-light mb-2 font-sans">
                Resultado real
              </p>
              <p className="font-serif text-sm text-dark-charcoal leading-snug">
                Maquillaje de novia · 2024
              </p>
            </div>
          </div>

          {/* Esquina decorativa dorada */}
          <div className="absolute top-14 right-14 w-16 h-16 border-t border-r border-gold-accent/35 pointer-events-none" />
        </div>
      </div>

      {/* ─── Imagen móvil ─────────────────────────────────── */}
      <div className="md:hidden absolute bottom-0 inset-x-0 h-[35vh] opacity-30">
        <div className="h-full bg-gradient-to-t from-muted-rose-light/60 to-transparent" />
      </div>

      {/* ─── Indicador de scroll ──────────────────────────── */}
      <div className="hidden lg:flex absolute right-7 bottom-12 flex-col items-center gap-3">
        <div className="h-14 w-px bg-charcoal-light/25" />
        <span className="text-[9px] tracking-[0.3em] uppercase text-charcoal-light [writing-mode:vertical-rl] rotate-180 font-sans">
          Scroll
        </span>
      </div>
    </section>
  );
}

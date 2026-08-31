import Image from "next/image";
import Link from "next/link";
import { getPublicServices } from "@/lib/appointments-data";

export async function CoursesSection() {
  const services = await getPublicServices();
  const curso = services.find((s) => s.name === "Curso de Automaquillaje");

  if (!curso) return null;

  const hours = curso.duration / 60;

  return (
    <section id="cursos" className="py-24 md:py-36 px-6 md:px-14 bg-cream-mid/25">
      <div className="max-w-[2200px] mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">

        {/* Imagen */}
        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden order-2 md:order-1">
          <Image
            src="/images/Cursos1.jpg"
            alt={curso.name}
            fill
            quality={85}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ objectPosition: "top" }}
          />
        </div>

        {/* Contenido */}
        <div className="order-1 md:order-2">
          <span className="block text-sm tracking-[0.25em] uppercase text-charcoal-light font-sans mb-3">
            — Aprende conmigo
          </span>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,5rem)] font-light text-dark-charcoal leading-tight mb-6">
            {curso.name}
          </h2>

          <div className="w-8 h-px bg-gold-accent mb-6" />

          <p className="font-sans text-[clamp(1rem,1vw,1.35rem)] leading-relaxed text-charcoal-light mb-8 max-w-lg">
            {curso.description}
          </p>

          <div className="flex items-center gap-6 mb-10">
            <p className="text-sm tracking-[0.15em] uppercase text-charcoal-light font-sans">
              {hours} horas
            </p>
          </div>

          <Link
            href="/booking"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-muted-rose text-white font-sans text-sm tracking-[0.1em] uppercase
              hover:bg-muted-rose-dark transition-colors duration-200 shadow-sm"
          >
            Reservar mi cupo
          </Link>
        </div>
      </div>
    </section>
  );
}

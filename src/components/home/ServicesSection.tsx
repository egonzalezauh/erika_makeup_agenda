import Image from "next/image";
import Link from "next/link";
import { getPublicServices } from "@/actions/appointments";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hora${h > 1 ? "s" : ""}` : `${h}h ${m} min`;
}

type ServiceImage = { src: string; objectPosition: string };

// Fotos elegidas a mano por servicio (ver public/images). Mantener sincronizado
// con CoursesSection.tsx y GallerySection.tsx para no repetir la misma foto.
// [0] = foto principal (única en móvil, grande a la izquierda en el collage de escritorio)
// [1], [2] = fotos secundarias, solo visibles en el collage de escritorio (md+)
const SERVICE_IMAGES: Record<string, [ServiceImage, ServiceImage, ServiceImage]> = {
  "Maquillaje Artístico": [
    { src: "/images/Artistico5.jpg", objectPosition: "center 30%" },
    { src: "/images/Artistico2.jpg", objectPosition: "top" },
    { src: "/images/Artistico3.jpg", objectPosition: "top" },
  ],
  "Maquillaje y Peinado de Novia": [
    { src: "/images/Novia3.jpg", objectPosition: "top" },
    { src: "/images/Novia1.jpg", objectPosition: "top" },
    { src: "/images/Novia2.jpg", objectPosition: "top" },
  ],
  "Maquillaje y Peinado de Quinceañera": [
    { src: "/images/Quinceanera3.jpg", objectPosition: "top" },
    { src: "/images/Quinceanera5.jpg", objectPosition: "top" },
    { src: "/images/Quinceanera1.jpg", objectPosition: "top" },
  ],
  "Maquillaje y Peinado Social": [
    { src: "/images/Social3.jpg", objectPosition: "top" },
    { src: "/images/Social1.jpg", objectPosition: "top" },
    { src: "/images/Social4.jpg", objectPosition: "top" },
  ],
};

// Orden de despliegue en el home (distinto del orden alfabético que usan el
// bot de Telegram y el wizard de reservas, que vienen de getServices()).
const DISPLAY_ORDER = [
  "Maquillaje y Peinado de Novia",
  "Maquillaje y Peinado de Quinceañera",
  "Maquillaje y Peinado Social",
  "Maquillaje Artístico",
];

export async function ServicesSection() {
  const allServices = await getPublicServices();
  // El curso tiene su propia sección en el home (ver CoursesSection), no se lista aquí.
  const services = allServices
    .filter((s) => s.name !== "Curso de Automaquillaje")
    .sort((a, b) => DISPLAY_ORDER.indexOf(a.name) - DISPLAY_ORDER.indexOf(b.name));

  const numbers = ["01", "02", "03", "04", "05"];

  return (
    <section id="servicios" className="py-24 md:py-36 px-6 md:px-14 bg-cream-soft">
      <div className="max-w-[2200px] mx-auto">

        {/* Encabezado */}
        <div className="flex items-end justify-between border-b border-cream-deep pb-8 mb-16 md:mb-20">
          <div>
            <span className="block text-sm tracking-[0.25em] uppercase text-charcoal-light font-sans mb-3">
              — Lo que ofrezco
            </span>
            <h2 className="font-serif text-[clamp(2.2rem,4vw,5rem)] font-light text-dark-charcoal leading-tight">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 md:gap-x-10 md:gap-y-20">
          {services.map((svc, i) => {
            const imgs = SERVICE_IMAGES[svc.name];
            return (
              <div key={svc.id} className="group">
                {/* Foto — una sola en móvil, mini-collage de 3 en escritorio */}
                {imgs && (
                  <div className="relative aspect-[4/5] overflow-hidden mb-6">
                    {/* Móvil: una foto */}
                    <div className="absolute inset-0 md:hidden">
                      <Image
                        src={imgs[0].src}
                        alt={svc.name}
                        fill
                        quality={85}
                        sizes="100vw"
                        className="object-cover"
                        style={{ objectPosition: imgs[0].objectPosition }}
                      />
                    </div>

                    {/* Escritorio: collage de 3 */}
                    <div className="hidden md:grid absolute inset-0 grid-cols-2 grid-rows-2 gap-1.5">
                      <div className="relative row-span-2 overflow-hidden">
                        <Image
                          src={imgs[0].src}
                          alt={svc.name}
                          fill
                          quality={85}
                          sizes="(max-width: 1024px) 25vw, 15vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          style={{ objectPosition: imgs[0].objectPosition }}
                        />
                      </div>
                      <div className="relative overflow-hidden">
                        <Image
                          src={imgs[1].src}
                          alt={`${svc.name} 2`}
                          fill
                          quality={85}
                          sizes="(max-width: 1024px) 25vw, 15vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          style={{ objectPosition: imgs[1].objectPosition }}
                        />
                      </div>
                      <div className="relative overflow-hidden">
                        <Image
                          src={imgs[2].src}
                          alt={`${svc.name} 3`}
                          fill
                          quality={85}
                          sizes="(max-width: 1024px) 25vw, 15vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          style={{ objectPosition: imgs[2].objectPosition }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Número editorial */}
                <span className="block font-serif text-[clamp(2.4rem,2.6vw,3.6rem)] leading-none font-bold text-charcoal-light/40 group-hover:text-muted-rose transition-colors duration-500 mb-4 select-none">
                  {numbers[i] ?? `0${i + 1}`}
                </span>

                {/* Nombre del servicio */}
                <h3 className="font-serif text-[clamp(1.5rem,1.8vw,2.4rem)] font-light text-dark-charcoal leading-[1.1] mb-4 group-hover:text-muted-rose transition-colors duration-300">
                  {svc.name}
                </h3>

                {/* Línea dorada */}
                <div className="w-8 h-px bg-gold-accent mb-6 group-hover:w-12 transition-all duration-500" />

                {/* Descripción */}
                <p className="font-sans text-[clamp(1rem,1vw,1.35rem)] leading-relaxed text-charcoal-light mb-10">
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
            );
          })}
        </div>
      </div>
    </section>
  );
}

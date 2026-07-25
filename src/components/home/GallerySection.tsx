/*
  Layout: 3 columnas, 2 filas
  Row 1: [ Novia: row-span-2 ] [ Look social ] [ Quinceañera ]
  Row 2: [ Novia: cont.      ] [ Sesión foto ] [ Editorial   ]

  auto-rows-[360px] en desktop → celdas simples ~434×360px (ratio 1.2:1, casi cuadrado).
  Con objectPosition:"top" las fotos portrait muestran cara completa sin cortar el mentón.
  La celda Novia (row-span-2) queda ~434×732px (portrait) — perfecta para foto de perfil.
*/
import Image from "next/image";

const GALLERY_ITEMS = [
  {
    label: "Novia · 2024",
    src: "/images/novia_ramo_frontal.jpeg",
    objectPosition: "top",
    span: "row-span-2",
    sizes: "(max-width: 768px) 50vw, 33vw",
  },
  {
    label: "Look social",
    src: "/images/maquillaje_ahumado_rosa.jpeg",
    objectPosition: "top",
    span: "",
    sizes: "(max-width: 768px) 50vw, 33vw",
  },
  {
    label: "Quinceañera",
    src: "/images/maquillaje_novia_ojos_abiertos.jpeg",
    objectPosition: "top",
    span: "",
    sizes: "(max-width: 768px) 50vw, 33vw",
  },
  {
    label: "Sesión fotográfica",
    src: "/images/artista_aplicando_maquillaje.jpeg",
    objectPosition: "top",
    span: "",
    sizes: "(max-width: 768px) 50vw, 33vw",
  },
  {
    label: "Editorial",
    src: "/images/maquillaje_editorial_verde.jpeg",
    objectPosition: "top",
    span: "",
    sizes: "(max-width: 768px) 50vw, 33vw",
  },
] as const;

export function GallerySection() {
  return (
    <section id="galeria" className="py-24 md:py-36 px-6 md:px-14 bg-cream-mid/25">
      <div className="max-w-[1440px] mx-auto">

        {/* Encabezado */}
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <span className="block text-[10px] tracking-[0.35em] uppercase text-charcoal-light font-sans mb-3">
              — Portafolio
            </span>
            <h2 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] font-light text-dark-charcoal leading-tight">
              Galería
            </h2>
          </div>
          <a
            href="https://www.instagram.com/erikaauhingmakeup"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-charcoal-light hover:text-muted-rose transition-colors duration-200 font-sans"
          >
            Ver en Instagram
            <span className="block w-7 h-px bg-current" />
          </a>
        </div>

        {/* Grid mosaico */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[220px] md:auto-rows-[480px]">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`${item.span} relative overflow-hidden group cursor-pointer`}
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                quality={85}
                sizes={item.sizes}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                style={{ objectPosition: item.objectPosition }}
              />

              {/* Overlay oscuro en hover */}
              <div className="absolute inset-0 bg-dark-charcoal/0 group-hover:bg-dark-charcoal/30 transition-all duration-400" />

              {/* Label que aparece en hover */}
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-dark-charcoal/65 to-transparent">
                <p className="text-[10px] tracking-[0.25em] uppercase text-cream-soft/90 font-sans">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Link Instagram en móvil */}
        <div className="mt-8 md:hidden text-center">
          <a
            href="https://www.instagram.com/erikaauhingmakeup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.3em] uppercase text-charcoal-light font-sans hover:text-muted-rose transition-colors"
          >
            Ver más en Instagram →
          </a>
        </div>
      </div>
    </section>
  );
}

const ITEMS = [
  "Maquillaje Social",
  "Novias",
  "Quinceañeras",
  "Fotografía",
  "Masterclass",
  "Eventos especiales",
] as const;

export function TickerStrip() {
  /* Duplicamos el array para que el loop sea seamless */
  const repeated = [...ITEMS, ...ITEMS];

  return (
    <div className="bg-dark-charcoal py-3.5 overflow-hidden">
      <div className="flex whitespace-nowrap ticker-animate">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 pr-5 font-sans text-[10px] tracking-[0.28em] uppercase text-cream-soft/35"
          >
            {item}
            <span className="text-gold-accent/60 text-[8px] shrink-0">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

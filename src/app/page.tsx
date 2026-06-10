import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-xl space-y-6">
        {/* Logo placeholder */}
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-3xl">💄</span>
        </div>

        <h1 className="text-4xl font-semibold tracking-tight">
          Makeup Studio
        </h1>
        <p className="text-lg leading-relaxed opacity-70">
          Maquillaje profesional para tus momentos más especiales. Bodas,
          quinceañeras, eventos y sesiones fotográficas.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Agendar Cita
          </Link>
          <Link
            href="/admin/calendar"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[var(--color-border)] font-medium hover:bg-[var(--color-surface)] transition-colors"
          >
            Vista Administrativa
          </Link>
        </div>

        {/* Nav links placeholder */}
        <nav className="flex gap-6 justify-center pt-4 text-sm opacity-50">
          <span>Servicios</span>
          <span>Galería</span>
          <span>Contacto</span>
        </nav>
      </div>
    </main>
  );
}

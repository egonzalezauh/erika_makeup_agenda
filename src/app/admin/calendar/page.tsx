import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Calendario Administrativo",
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HOURS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function AdminCalendarPage() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm opacity-50 hover:opacity-80 transition-opacity"
            >
              ← Inicio
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">
              Calendario de Citas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface)] transition-colors">
              ‹ Anterior
            </button>
            <span className="text-sm font-medium px-2 opacity-70">
              Junio 2025
            </span>
            <button className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface)] transition-colors">
              Siguiente ›
            </button>
          </div>
        </div>

        {/* Calendar grid placeholder */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-[var(--color-border)]">
            <div className="py-3 px-3 text-xs font-medium opacity-40 text-center">Hora</div>
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-3 text-xs font-medium opacity-50 text-center border-l border-[var(--color-border)]"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Time rows */}
          {HOURS.map((hour, hi) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-[var(--color-border)] last:border-b-0"
            >
              <div className="py-3 px-3 text-xs opacity-40 text-right pr-3">
                {hour}
              </div>
              {DAYS.map((d, di) => (
                <div
                  key={d}
                  className="border-l border-[var(--color-border)] py-1 px-1 min-h-[44px] hover:bg-[var(--color-cream-100)] transition-colors cursor-pointer relative"
                >
                  {/* Sample appointment placeholders */}
                  {hi === 1 && di === 1 && (
                    <div className="rounded-md bg-[var(--color-rose-200)] border border-[var(--color-rose-300)] px-1.5 py-1 text-[10px] leading-tight">
                      <p className="font-medium text-[var(--color-warm-800)]">María G.</p>
                      <p className="opacity-60">Maquillaje novia</p>
                    </div>
                  )}
                  {hi === 3 && di === 4 && (
                    <div className="rounded-md bg-[var(--color-gold-100)] border border-[var(--color-gold-200)] px-1.5 py-1 text-[10px] leading-tight">
                      <p className="font-medium text-[var(--color-warm-800)]">Laura R.</p>
                      <p className="opacity-60">Quinceañera</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="text-center text-xs opacity-30">
          Calendario administrativo — próximamente funcional con datos reales
        </p>
      </div>
    </main>
  );
}

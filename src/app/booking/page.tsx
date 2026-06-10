import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agendar Cita",
};

export default function BookingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block text-sm opacity-50 hover:opacity-80 transition-opacity mb-2"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            Agenda tu Cita
          </h1>
          <p className="opacity-60 text-sm">
            Completa el formulario y nos pondremos en contacto contigo para
            confirmar tu cita.
          </p>
        </div>

        {/* Form placeholder card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 space-y-5">
          <div className="space-y-1">
            <div className="h-4 w-24 rounded bg-[var(--color-border)]" />
            <div className="h-10 w-full rounded-lg bg-[var(--color-cream-200)]" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-32 rounded bg-[var(--color-border)]" />
            <div className="h-10 w-full rounded-lg bg-[var(--color-cream-200)]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="h-4 w-16 rounded bg-[var(--color-border)]" />
              <div className="h-10 rounded-lg bg-[var(--color-cream-200)]" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-16 rounded bg-[var(--color-border)]" />
              <div className="h-10 rounded-lg bg-[var(--color-cream-200)]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-4 w-28 rounded bg-[var(--color-border)]" />
            <div className="h-24 w-full rounded-lg bg-[var(--color-cream-200)]" />
          </div>

          <div className="pt-2">
            <div className="h-11 w-full rounded-full bg-[var(--color-primary)] opacity-60" />
          </div>

          <p className="text-center text-xs opacity-40">
            Formulario de citas — próximamente funcional
          </p>
        </div>
      </div>
    </main>
  );
}

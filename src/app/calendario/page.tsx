import type { Metadata } from "next";
import Link from "next/link";
import { getPublicAppointmentAvailability } from "@/actions/appointments";
import { AvailabilityCalendar } from "@/components/calendario/AvailabilityCalendar";

export const metadata: Metadata = {
  title: "Calendario — ERIKAAUHINGMAKEUP",
};

export default async function CalendarioPage() {
  const appointments = await getPublicAppointmentAvailability();

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-cream-soft px-4 py-24">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-xs text-charcoal-light hover:text-muted-rose transition-colors tracking-widest uppercase"
          >
            ← Inicio
          </Link>
          <div className="mt-3">
            <p className="text-xs text-charcoal-light uppercase tracking-widest mb-1">
              Disponibilidad
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-dark-charcoal leading-tight">
              Calendario
            </h1>
            <p className="text-sm text-charcoal-light capitalize mt-1">
              {today}
            </p>
          </div>
          <div className="mt-4 h-px bg-cream-deep" />
        </div>

        <AvailabilityCalendar appointments={appointments} />

        <div className="mt-10 text-center">
          <Link
            href="/booking"
            className="inline-block px-8 py-3 rounded-full bg-muted-rose text-white font-medium text-sm tracking-wide
              hover:bg-muted-rose-dark transition-colors shadow-sm"
          >
            Agendar una cita →
          </Link>
        </div>
      </div>
    </main>
  );
}

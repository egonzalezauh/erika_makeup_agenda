import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getPublicServices, getPublicAppointmentAvailability } from "@/lib/appointments-data";
import Link from "next/link";

export const dynamic = "force-dynamic"; // nunca servir disponibilidad obsoleta

export const metadata: Metadata = {
  title: "Agendar Cita — ERIKAAUHINGMAKEUP",
  description: "Reserva tu cita de maquillaje y peinado de forma rápida y sencilla.",
};

export default async function BookingPage() {
  const [services, appointments] = await Promise.all([
    getPublicServices(),
    getPublicAppointmentAvailability(),
  ]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-cream-soft pt-24 pb-20 px-4">
        {/* Header */}
        <div className="text-center mb-12 max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[clamp(12px,0.7vw,15px)] font-medium text-charcoal-light
              hover:text-muted-rose transition-colors tracking-widest uppercase mb-6"
          >
            <span>←</span> Volver al inicio
          </Link>
          <h1 className="font-serif text-[clamp(2.2rem,4vw,4.5rem)] text-dark-charcoal leading-tight">
            Agenda tu <em className="text-muted-rose not-italic">Cita</em>
          </h1>
          <p className="mt-3 text-[clamp(14px,0.9vw,18px)] text-charcoal-light max-w-md mx-auto leading-relaxed">
            Completa los pasos a continuación. Confirmaremos tu reserva por
            WhatsApp o correo.
          </p>
          {/* Gold divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-10 bg-gold-accent" />
            <div className="w-1 h-1 rounded-full bg-gold-accent" />
            <div className="h-px w-10 bg-gold-accent" />
          </div>
        </div>

        {/* Wizard */}
        <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-sm rounded-3xl border border-cream-deep shadow-sm p-6 md:p-10">
          {services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-charcoal-light text-sm">
                No hay servicios disponibles en este momento.
              </p>
            </div>
          ) : (
            <BookingWizard services={services} appointments={appointments} />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

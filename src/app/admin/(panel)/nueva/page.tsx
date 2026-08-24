import type { Metadata } from "next";
import { getServices } from "@/actions/appointments";
import { guayaquilDateString } from "@/lib/dates";
import AppointmentForm from "@/components/admin/AppointmentForm";

export const metadata: Metadata = { title: "Agendar" };
export const dynamic = "force-dynamic";

export default async function NewAppointmentPage() {
  const services = await getServices();

  return (
    <>
      <header>
        <p className="font-sans text-[0.65rem] tracking-[0.24em] uppercase text-muted-rose">
          Nueva cita
        </p>
        <h1 className="mt-2 font-serif text-3xl text-dark-charcoal">Agendar</h1>
      </header>

      <AppointmentForm
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
        }))}
        initial={{
          serviceId:   "",
          date:        guayaquilDateString(),
          timeSlot:    "",
          clientName:  "",
          clientPhone: "",
          clientEmail: "",
          notes:       "",
        }}
        submitLabel="Guardar cita"
      />
    </>
  );
}

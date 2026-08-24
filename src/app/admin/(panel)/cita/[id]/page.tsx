import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppointmentById, getServices } from "@/actions/appointments";
import AppointmentForm from "@/components/admin/AppointmentForm";
import StatusBadge from "@/components/admin/StatusBadge";

export const metadata: Metadata = { title: "Editar cita" };
export const dynamic = "force-dynamic";

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [appointment, services] = await Promise.all([
    getAppointmentById(id),
    getServices(),
  ]);

  if (!appointment) notFound();

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-[0.65rem] tracking-[0.24em] uppercase text-muted-rose">
            Editar
          </p>
          <h1 className="mt-2 font-serif text-3xl text-dark-charcoal">
            {appointment.clientName}
          </h1>
        </div>
        <span className="mt-2">
          <StatusBadge status={appointment.status} />
        </span>
      </header>

      <AppointmentForm
        appointmentId={appointment.id}
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
        }))}
        initial={{
          serviceId: appointment.serviceId,
          // La fecha se guarda como medianoche UTC: el string ISO ya trae el
          // día correcto, mientras que parsearla como Date la correría.
          date:        appointment.date.toISOString().split("T")[0],
          timeSlot:    appointment.timeSlot,
          clientName:  appointment.clientName,
          clientPhone: appointment.clientPhone,
          clientEmail: appointment.clientEmail,
          notes:       appointment.notes ?? "",
        }}
        submitLabel="Guardar cambios"
      />
    </>
  );
}

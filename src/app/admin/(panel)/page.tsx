import { getAppointmentsByDate } from "@/actions/appointments";
import { guayaquilDateString } from "@/lib/dates";
import AppointmentCard, {
  type AppointmentCardData,
} from "@/components/admin/AppointmentCard";
import LogoutButton from "@/components/admin/LogoutButton";

// Siempre datos frescos: la agenda del día cambia mientras se usa.
export const dynamic = "force-dynamic";

const longDate = new Intl.DateTimeFormat("es-EC", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Guayaquil",
});

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default async function AdminTodayPage() {
  const today = guayaquilDateString();
  const appointments = await getAppointmentsByDate(today);

  // Las canceladas van al final: siguen visibles por si hay que reabrirlas,
  // pero no estorban la lectura del día.
  const ordered = [...appointments].sort((a, b) => {
    const aOff = a.status === "CANCELADA" ? 1 : 0;
    const bOff = b.status === "CANCELADA" ? 1 : 0;
    return aOff - bOff;
  });

  const activas = appointments.filter((a) => a.status !== "CANCELADA").length;

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-[0.65rem] tracking-[0.24em] uppercase text-muted-rose">
            Hoy
          </p>
          <h1 className="mt-2 font-serif text-3xl leading-tight text-dark-charcoal">
            {capitalize(longDate.format(new Date(`${today}T12:00:00`)))}
          </h1>
          <p className="mt-1 font-sans text-sm text-charcoal-light">
            {activas === 0
              ? "Sin citas por ahora"
              : activas === 1
                ? "1 cita agendada"
                : `${activas} citas agendadas`}
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="mt-7 flex flex-col gap-3">
        {ordered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-cream-deep px-6 py-12 text-center">
            <p className="font-serif text-xl text-charcoal-mid">
              Día libre
            </p>
            <p className="mt-2 font-sans text-sm text-charcoal-light">
              No tienes citas para hoy. Usa Agendar si quieres registrar una.
            </p>
          </div>
        ) : (
          ordered.map((appointment) => {
            const data: AppointmentCardData = {
              id:          appointment.id,
              clientName:  appointment.clientName,
              clientPhone: appointment.clientPhone,
              timeSlot:    appointment.timeSlot,
              status:      appointment.status,
              notes:       appointment.notes,
              serviceName: appointment.service.name,
              duration:    appointment.service.duration,
            };
            return <AppointmentCard key={data.id} appointment={data} />;
          })
        )}
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { getUpcomingAppointments } from "@/actions/appointments";
import { guayaquilDateString } from "@/lib/dates";
import AppointmentCard, {
  type AppointmentCardData,
} from "@/components/admin/AppointmentCard";
import CancelledRow from "@/components/admin/CancelledRow";

export const metadata: Metadata = { title: "Agenda" };
export const dynamic = "force-dynamic";

const dayLabel = new Intl.DateTimeFormat("es-EC", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Guayaquil",
});

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default async function AgendaPage() {
  const today = guayaquilDateString();
  const tomorrow = guayaquilDateString(1);
  const upcoming = await getUpcomingAppointments(today);

  // Prisma guarda la fecha como medianoche UTC, así que la clave del día
  // se saca del ISO directamente — parsearla con `new Date()` en un equipo
  // UTC-5 la correría un día hacia atrás.
  const byDay = new Map<string, typeof upcoming>();
  for (const appointment of upcoming) {
    const key = appointment.date.toISOString().split("T")[0];
    byDay.set(key, [...(byDay.get(key) ?? []), appointment]);
  }

  return (
    <>
      <header>
        <p className="font-sans text-[0.65rem] tracking-[0.24em] uppercase text-muted-rose">
          Próximas citas
        </p>
        <h1 className="mt-2 font-serif text-3xl text-dark-charcoal">Agenda</h1>
      </header>

      {byDay.size === 0 ? (
        <div className="mt-7 rounded-3xl border border-dashed border-cream-deep px-6 py-12 text-center">
          <p className="font-serif text-xl text-charcoal-mid">
            Nada por delante
          </p>
          <p className="mt-2 font-sans text-sm text-charcoal-light">
            No hay citas próximas registradas.
          </p>
        </div>
      ) : (
        <div className="mt-7 flex flex-col gap-8">
          {[...byDay.entries()].map(([day, appointments]) => (
            <section key={day}>
              <h2 className="mb-3 font-sans text-xs tracking-[0.18em] uppercase text-charcoal-light">
                {day === today
                  ? "Hoy"
                  : day === tomorrow
                    ? "Mañana"
                    : capitalize(dayLabel.format(new Date(`${day}T12:00:00`)))}
              </h2>

              <div className="flex flex-col gap-3">
                {appointments.map((appointment) => {
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
                  return data.status === "CANCELADA" ? (
                    <CancelledRow key={data.id} appointment={data} />
                  ) : (
                    <AppointmentCard key={data.id} appointment={data} />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

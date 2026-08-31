import AppointmentCard, {
  type AppointmentCardData,
} from "@/components/admin/AppointmentCard";
import { formatTime } from "@/lib/utils";

const shortDate = new Intl.DateTimeFormat("es-EC", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "America/Guayaquil",
});

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type OverdueAppointment = AppointmentCardData & { date: string };

// Citas PENDIENTE/CONFIRMADA de días anteriores a hoy: sin esto, se
// pierden de vista para siempre (Agenda solo muestra date >= hoy, y Hoy
// solo el día actual), aunque sigan activas en la base. Colapsada por
// defecto — es <details> nativo, no necesita JS para abrir/cerrar — para
// no ensuciar la pantalla principal cuando no hay ninguna atrasada.
export default function OverdueSection({
  appointments,
}: {
  appointments: OverdueAppointment[];
}) {
  if (appointments.length === 0) return null;

  return (
    <details className="mt-7 rounded-3xl border border-muted-rose bg-muted-rose-light/30 open:pb-2">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-sans text-sm text-muted-rose-dark">
        <span>
          {appointments.length === 1
            ? "1 cita atrasada sin resolver"
            : `${appointments.length} citas atrasadas sin resolver`}
        </span>
        <span className="text-xs tracking-[0.14em] uppercase">Ver</span>
      </summary>
      <div className="flex flex-col gap-3 px-3 pb-3">
        {appointments.map((appointment) => (
          <div key={appointment.id}>
            <p className="mb-1 px-2 font-sans text-xs text-charcoal-light">
              {capitalize(
                shortDate.format(new Date(`${appointment.date}T12:00:00`))
              )}{" "}
              · {formatTime(appointment.timeSlot)}
            </p>
            <AppointmentCard appointment={appointment} />
          </div>
        ))}
      </div>
    </details>
  );
}

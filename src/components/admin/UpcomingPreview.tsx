import Link from "next/link";
import { formatTime } from "@/lib/utils";

const weekdayShort = new Intl.DateTimeFormat("es-EC", {
  weekday: "short",
  timeZone: "America/Guayaquil",
});

export type UpcomingItem = {
  id: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string;
  clientName: string;
};

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Vista adelantada bajo las citas de hoy: una lista compacta de lo que
// viene esta semana (sin el detalle completo de una tarjeta) y solo un
// conteo del resto del mes, que manda a Agenda para el detalle.
export default function UpcomingPreview({
  thisWeek,
  laterThisMonthCount,
}: {
  thisWeek: UpcomingItem[];
  laterThisMonthCount: number;
}) {
  if (thisWeek.length === 0 && laterThisMonthCount === 0) return null;

  return (
    <div className="mt-8 flex flex-col gap-6">
      {thisWeek.length > 0 && (
        <section>
          <h2 className="mb-3 font-sans text-xs tracking-[0.18em] uppercase text-charcoal-light">
            Esta semana
          </h2>
          <div className="flex flex-col gap-1 rounded-3xl border border-cream-deep bg-white px-4 py-2">
            {thisWeek.map((item, index) => (
              <Link
                key={item.id}
                href={`/admin/cita/${item.id}`}
                className={
                  "flex items-center gap-3 py-2.5" +
                  (index > 0 ? " border-t border-cream-soft" : "")
                }
              >
                <span className="w-9 shrink-0 font-sans text-xs uppercase text-muted-rose">
                  {capitalize(weekdayShort.format(new Date(`${item.date}T12:00:00`)))}
                </span>
                <span className="w-16 shrink-0 font-sans text-sm text-charcoal-mid">
                  {formatTime(item.timeSlot)}
                </span>
                <span className="flex-1 truncate font-sans text-sm text-dark-charcoal">
                  {item.clientName}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {laterThisMonthCount > 0 && (
        <Link
          href="/admin/agenda"
          className="flex items-center justify-between rounded-3xl border border-cream-deep bg-white px-5 py-4"
        >
          <span className="font-sans text-sm text-charcoal-mid">
            {laterThisMonthCount === 1
              ? "1 cita más este mes"
              : `${laterThisMonthCount} citas más este mes`}
          </span>
          <span className="font-sans text-sm text-muted-rose">Ver →</span>
        </Link>
      )}
    </div>
  );
}

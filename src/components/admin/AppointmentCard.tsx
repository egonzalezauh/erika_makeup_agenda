"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, Pencil, Phone, Trash2 } from "lucide-react";
import { adminUpdateAppointmentStatus } from "@/actions/admin";
import { cn, formatTime, whatsappHref } from "@/lib/utils";
import { minutesToTime, timeToMinutes } from "@/lib/time";
import StatusBadge from "@/components/admin/StatusBadge";

export type AppointmentCardData = {
  id:          string;
  clientName:  string;
  clientPhone: string;
  timeSlot:    string;
  status:      string;
  notes:       string | null;
  serviceName: string;
  duration:    number;
};

type Status = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA" | "ELIMINADA";
type Action = { label: string; status: Status; tone: "primary" | "quiet" };

// Qué puede hacer la dueña según en qué punto está la cita. Mostramos solo
// los pasos que tienen sentido ahora — una lista corta de botones grandes
// es más fácil de usar en el celular que un menú con todos los estados.
function actionsFor(status: string): Action[] {
  switch (status) {
    case "PENDIENTE":
      return [
        { label: "Confirmar", status: "CONFIRMADA", tone: "primary" },
        { label: "Cancelar",  status: "CANCELADA",  tone: "quiet"   },
      ];
    case "CONFIRMADA":
      return [
        { label: "Completar", status: "COMPLETADA", tone: "primary" },
        { label: "Cancelar",  status: "CANCELADA",  tone: "quiet"   },
      ];
    default: // COMPLETADA | CANCELADA
      return [{ label: "Reabrir", status: "PENDIENTE", tone: "quiet" }];
  }
}

export default function AppointmentCard({
  appointment,
}: {
  appointment: AppointmentCardData;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const endTime = minutesToTime(
    timeToMinutes(appointment.timeSlot) + appointment.duration
  );
  const waLink = whatsappHref(appointment.clientPhone);
  const isInactive =
    appointment.status === "CANCELADA" || appointment.status === "COMPLETADA";

  function changeStatus(status: Status) {
    setError(null);
    startTransition(async () => {
      const result = await adminUpdateAppointmentStatus(appointment.id, status);
      if (!result.success) setError(result.error ?? "No se pudo actualizar.");
    });
  }

  // "Eliminar" no borra el registro — le pone un estado que la saca de Hoy
  // y Agenda para siempre, sin tocar la base. Al no haber forma de reabrirla
  // desde acá, se confirma antes de aplicarlo.
  function remove() {
    if (!window.confirm(`¿Eliminar la cita de ${appointment.clientName}? No vas a poder verla más en la app.`)) {
      return;
    }
    changeStatus("ELIMINADA");
  }

  return (
    <article
      className={cn(
        "rounded-3xl border border-cream-deep bg-white p-5 transition-opacity",
        isInactive && "opacity-60",
        isPending && "opacity-50"
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-2xl leading-none text-dark-charcoal">
            {formatTime(appointment.timeSlot)}
          </p>
          <p className="mt-1 font-sans text-xs text-charcoal-light">
            hasta {formatTime(endTime)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={appointment.status} />
          {/* Botón explícito en vez de hacer toda la tarjeta tocable: junto a
              los botones de estado, una zona invisible sería fácil de pulsar
              por error. */}
          <Link
            href={`/admin/cita/${appointment.id}`}
            aria-label={`Editar la cita de ${appointment.clientName}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-deep text-charcoal-light active:bg-cream-mid"
          >
            <Pencil size={16} strokeWidth={1.7} aria-hidden />
          </Link>
          <button
            type="button"
            aria-label={`Eliminar la cita de ${appointment.clientName}`}
            disabled={isPending}
            onClick={remove}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-deep text-charcoal-light active:bg-cream-mid disabled:opacity-50"
          >
            <Trash2 size={16} strokeWidth={1.7} aria-hidden />
          </button>
        </div>
      </header>

      <div className="mt-4">
        <p className="font-sans text-lg text-dark-charcoal">
          {appointment.clientName}
        </p>
        <p className="font-sans text-sm text-charcoal-mid">
          {appointment.serviceName}
        </p>
        {appointment.notes && (
          <p className="mt-2 rounded-xl bg-cream-soft px-3 py-2 font-sans text-sm text-charcoal-mid">
            {appointment.notes}
          </p>
        )}
      </div>

      {/* Contacto: un toque para escribirle o llamarla, sin copiar números */}
      <div className="mt-4 flex gap-2">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-cream-deep font-sans text-sm text-charcoal-mid active:bg-cream-mid"
          >
            <MessageCircle size={17} strokeWidth={1.7} aria-hidden />
            WhatsApp
          </a>
        )}
        <a
          href={`tel:${appointment.clientPhone.replace(/\s/g, "")}`}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-cream-deep font-sans text-sm text-charcoal-mid active:bg-cream-mid"
        >
          <Phone size={17} strokeWidth={1.7} aria-hidden />
          Llamar
        </a>
      </div>

      <div className="mt-2 flex gap-2">
        {actionsFor(appointment.status).map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={isPending}
            onClick={() => changeStatus(action.status)}
            className={cn(
              "h-12 flex-1 rounded-2xl font-sans text-sm tracking-[0.06em] uppercase transition-colors disabled:opacity-60",
              action.tone === "primary"
                ? "bg-muted-rose text-cream-soft active:bg-muted-rose-dark"
                : "border border-cream-deep text-charcoal-light active:bg-cream-mid"
            )}
          >
            {action.label}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-muted-rose-light/50 px-3 py-2 font-sans text-sm text-muted-rose-dark"
        >
          {error}
        </p>
      )}
    </article>
  );
}

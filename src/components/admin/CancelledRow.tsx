"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { adminUpdateAppointmentStatus } from "@/actions/admin";
import { cn, formatTime } from "@/lib/utils";
import type { AppointmentCardData } from "@/components/admin/AppointmentCard";

// Versión colapsada de AppointmentCard para citas CANCELADA: una tarjeta
// completa del mismo tamaño que una activa "hace ruido" al leer el día —
// esta fila ocupa una sola línea mientras se mantiene reabrible con un toque.
export default function CancelledRow({
  appointment,
}: {
  appointment: AppointmentCardData;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reopen() {
    setError(null);
    startTransition(async () => {
      const result = await adminUpdateAppointmentStatus(appointment.id, "PENDIENTE");
      if (!result.success) setError(result.error ?? "No se pudo reabrir.");
    });
  }

  return (
    <div className={cn("transition-opacity", isPending && "opacity-50")}>
      <div className="flex items-center gap-3 rounded-2xl border border-cream-deep bg-cream-soft px-4 py-3">
        <span className="font-sans text-sm text-charcoal-light">
          {formatTime(appointment.timeSlot)}
        </span>
        <span className="flex-1 truncate font-sans text-sm text-charcoal-light line-through">
          {appointment.clientName}
        </span>
        <span className="font-sans text-[0.6rem] tracking-[0.14em] uppercase text-charcoal-light">
          Cancelada
        </span>
        <button
          type="button"
          aria-label={`Reabrir la cita de ${appointment.clientName}`}
          disabled={isPending}
          onClick={reopen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream-deep text-charcoal-light active:bg-cream-mid disabled:opacity-50"
        >
          <RotateCcw size={14} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-1 px-1 font-sans text-xs text-muted-rose-dark">
          {error}
        </p>
      )}
    </div>
  );
}

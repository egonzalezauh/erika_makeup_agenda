"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminCreateAppointment, adminUpdateAppointment } from "@/actions/admin";
import { BUSINESS_TIME_SLOTS } from "@/lib/time";
import { formatTime } from "@/lib/utils";

export type ServiceOption = { id: string; name: string; duration: number };

export type AppointmentFormValues = {
  serviceId:   string;
  date:        string; // "YYYY-MM-DD"
  timeSlot:    string; // "HH:mm"
  clientName:  string;
  clientPhone: string;
  clientEmail: string;
  notes:       string;
};

const FIELD =
  "h-14 w-full rounded-2xl border border-cream-deep bg-white px-4 font-sans text-base text-dark-charcoal outline-none focus:border-muted-rose";

const LABEL =
  "font-sans text-xs tracking-[0.16em] uppercase text-charcoal-light";

// Un mismo formulario para registrar y para editar/reprogramar: los campos
// son idénticos, solo cambia qué acción recibe los datos y a dónde vuelve
// después. Mantenerlos juntos evita que se separen con el tiempo y que
// arreglar algo en uno deje el otro atrás.
export default function AppointmentForm({
  services,
  initial,
  appointmentId,
  submitLabel,
}: {
  services: ServiceOption[];
  initial: AppointmentFormValues;
  /** Presente = editar una cita existente; ausente = crear una nueva. */
  appointmentId?: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(appointmentId);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const values = {
      clientName:  String(form.get("clientName") ?? "").trim(),
      clientPhone: String(form.get("clientPhone") ?? "").trim(),
      clientEmail: String(form.get("clientEmail") ?? "").trim(),
      date:        String(form.get("date") ?? ""),
      timeSlot:    String(form.get("timeSlot") ?? ""),
      serviceId:   String(form.get("serviceId") ?? ""),
      notes:       String(form.get("notes") ?? "").trim() || undefined,
    };

    startTransition(async () => {
      const result = appointmentId
        ? await adminUpdateAppointment(appointmentId, values)
        : await adminCreateAppointment({
            ...values,
            // Si la dueña la registra a mano es porque ya la acordó con la
            // clienta — no tiene sentido que nazca PENDIENTE de su propia
            // confirmación. Mismo criterio que usaba el bot de Telegram.
            status: "CONFIRMADA",
          });

      if (result.success) {
        router.push("/admin/agenda");
        router.refresh();
      } else {
        setError(result.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className={LABEL}>Servicio</span>
        <select
          name="serviceId"
          required
          defaultValue={initial.serviceId}
          className={FIELD}
        >
          <option value="" disabled>
            Elegir servicio…
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {service.duration} min
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-2">
          <span className={LABEL}>Fecha</span>
          <input
            type="date"
            name="date"
            required
            defaultValue={initial.date}
            className={FIELD}
          />
        </label>

        <label className="flex flex-1 flex-col gap-2">
          <span className={LABEL}>Hora</span>
          <select
            name="timeSlot"
            required
            defaultValue={initial.timeSlot}
            className={FIELD}
          >
            <option value="" disabled>
              Hora…
            </option>
            {BUSINESS_TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {formatTime(slot)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Nombre de la clienta</span>
        <input
          type="text"
          name="clientName"
          required
          defaultValue={initial.clientName}
          className={FIELD}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Teléfono</span>
        <input
          type="tel"
          name="clientPhone"
          inputMode="tel"
          required
          placeholder="0991234567"
          defaultValue={initial.clientPhone}
          className={FIELD}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Correo (opcional)</span>
        <input
          type="email"
          name="clientEmail"
          inputMode="email"
          defaultValue={initial.clientEmail}
          className={FIELD}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Notas (opcional)</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initial.notes}
          className="w-full rounded-2xl border border-cream-deep bg-white px-4 py-3 font-sans text-base text-dark-charcoal outline-none focus:border-muted-rose"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-muted-rose-light/50 px-4 py-3 font-sans text-sm text-muted-rose-dark"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-14 rounded-2xl bg-muted-rose font-sans text-base tracking-[0.08em] uppercase text-cream-soft transition-colors active:bg-muted-rose-dark disabled:opacity-60"
      >
        {isPending ? "Guardando…" : submitLabel}
      </button>

      {isEditing && (
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="h-14 rounded-2xl border border-cream-deep font-sans text-base tracking-[0.06em] uppercase text-charcoal-light active:bg-cream-mid disabled:opacity-60"
        >
          Descartar
        </button>
      )}
    </form>
  );
}

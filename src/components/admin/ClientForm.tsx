"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient, updateClient } from "@/actions/clients";

export type ClientFormValues = {
  name:  string;
  phone: string;
  email: string;
  notes: string;
};

const FIELD =
  "h-14 w-full rounded-2xl border border-cream-deep bg-white px-4 font-sans text-base text-dark-charcoal outline-none focus:border-muted-rose";

const LABEL =
  "font-sans text-xs tracking-[0.16em] uppercase text-charcoal-light";

// Mismo patrón que AppointmentForm: un solo formulario para crear y
// editar, solo cambia qué acción recibe los datos.
export default function ClientForm({
  initial,
  clientId,
  submitLabel,
}: {
  initial: ClientFormValues;
  /** Presente = editar una clienta existente; ausente = crear una nueva. */
  clientId?: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) {
      setError("Escribe el nombre de la clienta.");
      return;
    }

    const values = {
      name,
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      notes: String(form.get("notes") ?? "").trim(),
    };

    startTransition(async () => {
      const result = clientId
        ? await updateClient(clientId, values)
        : await createClient(values);

      if (result.success) {
        router.push("/admin/clientes");
        router.refresh();
      } else {
        setError(result.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className={LABEL}>Nombre</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={initial.name}
          className={FIELD}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Teléfono (opcional)</span>
        <input
          type="tel"
          name="phone"
          inputMode="tel"
          placeholder="0991234567"
          defaultValue={initial.phone}
          className={FIELD}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={LABEL}>Correo (opcional)</span>
        <input
          type="email"
          name="email"
          inputMode="email"
          defaultValue={initial.email}
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

      {clientId && (
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

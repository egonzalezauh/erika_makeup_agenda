"use client";

import { useState } from "react";
import Link from "next/link";

export type ClientListItem = {
  id:    string;
  name:  string;
  phone: string | null;
  email: string | null;
};

// Filtro en JS sobre la lista completa — mismo criterio que ya usa
// searchAppointmentsByClientName: de sobra para la escala real de este
// negocio, sin ida y vuelta al servidor mientras se escribe.
export default function ClientList({ clients }: { clients: ClientListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="mt-7 flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre…"
        className="h-14 w-full rounded-2xl border border-cream-deep bg-white px-4 font-sans text-base text-dark-charcoal outline-none focus:border-muted-rose"
      />

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-cream-deep px-6 py-12 text-center">
          <p className="font-serif text-xl text-charcoal-mid">
            {clients.length === 0 ? "Sin clientas guardadas" : "Sin resultados"}
          </p>
          <p className="mt-2 font-sans text-sm text-charcoal-light">
            {clients.length === 0
              ? "Usa \"Nueva clienta\" para empezar a guardarlas."
              : "Prueba con otro nombre."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 rounded-3xl border border-cream-deep bg-white px-4 py-2">
          {filtered.map((client, index) => (
            <Link
              key={client.id}
              href={`/admin/clientes/${client.id}`}
              className={
                "flex items-center gap-3 py-3" +
                (index > 0 ? " border-t border-cream-soft" : "")
              }
            >
              <span className="flex-1 truncate font-sans text-sm text-dark-charcoal">
                {client.name}
              </span>
              {client.phone && (
                <span className="shrink-0 font-sans text-xs text-charcoal-light">
                  {client.phone}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

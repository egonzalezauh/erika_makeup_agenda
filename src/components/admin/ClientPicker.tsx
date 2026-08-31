"use client";

import { useRef, useState } from "react";
import { createClient } from "@/actions/clients";

export type ClientOption = {
  id:    string;
  name:  string;
  phone: string | null;
  email: string | null;
};

type Selected = { id: string | null; name: string; phone: string; email: string };

const FIELD =
  "h-14 w-full rounded-2xl border border-cream-deep bg-white px-4 font-sans text-base text-dark-charcoal outline-none focus:border-muted-rose";

const LABEL =
  "font-sans text-xs tracking-[0.16em] uppercase text-charcoal-light";

// Reemplaza los campos de texto libre de nombre/teléfono/correo en
// AppointmentForm: se elige una clienta guardada (o se crea una nueva
// al vuelo) en vez de escribirla a mano cada vez. Alimenta el <form>
// que lo envuelve con inputs ocultos (clientName/clientPhone/
// clientEmail) — así el submit de AppointmentForm no cambia, solo
// cambia de dónde vienen esos valores.
export default function ClientPicker({
  clients,
  initial,
}: {
  clients: ClientOption[];
  initial: { name: string; phone: string; email: string };
}) {
  const [selected, setSelected] = useState<Selected>({
    id: null,
    name:  initial.name,
    phone: initial.phone,
    email: initial.email,
  });
  const [query, setQuery] = useState(initial.name);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Evita que el blur del input (con su setTimeout) borre lo escrito en
  // el mini-form de "+ Nueva clienta" justo al abrirlo — un ref se lee
  // al instante, sin esperar el re-render de `creating`.
  const creatingRef = useRef(false);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  function selectClient(c: ClientOption) {
    creatingRef.current = false;
    setSelected({ id: c.id, name: c.name, phone: c.phone ?? "", email: c.email ?? "" });
    setQuery(c.name);
    setOpen(false);
    setCreating(false);
  }

  function openCreateForm() {
    creatingRef.current = true;
    setNewName(query.trim());
    setNewPhone("");
    setNewEmail("");
    setCreateError(null);
    setCreating(true);
    setOpen(false);
  }

  async function saveNewClient() {
    const name = newName.trim();
    if (!name) {
      setCreateError("Escribe el nombre de la clienta.");
      return;
    }
    setSavingNew(true);
    setCreateError(null);
    const result = await createClient({
      name,
      phone: newPhone.trim(),
      email: newEmail.trim(),
    });
    setSavingNew(false);

    if (result.success && result.client) {
      selectClient(result.client);
    } else {
      setCreateError(result.error ?? "No se pudo guardar la clienta.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-2">
        <span className={LABEL}>Clienta</span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() =>
            setTimeout(() => {
              setOpen(false);
              if (!creatingRef.current) setQuery(selected.name);
            }, 150)
          }
          placeholder="Buscar clienta…"
          className={FIELD}
        />
      </label>

      {open && (
        <div className="flex flex-col gap-1 rounded-2xl border border-cream-deep bg-white px-2 py-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={() => selectClient(c)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left active:bg-cream-mid"
            >
              <span className="font-sans text-sm text-dark-charcoal">{c.name}</span>
              {c.phone && (
                <span className="font-sans text-xs text-charcoal-light">{c.phone}</span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-2 font-sans text-sm text-charcoal-light">
              Sin clientas con ese nombre.
            </p>
          )}
          <button
            type="button"
            onMouseDown={openCreateForm}
            className="rounded-xl border-t border-cream-soft px-3 py-2.5 text-left font-sans text-sm text-muted-rose-dark active:bg-cream-mid"
          >
            + Nueva clienta
          </button>
        </div>
      )}

      {creating && (
        <div className="flex flex-col gap-3 rounded-2xl border border-cream-deep bg-cream-soft/60 p-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre"
            autoFocus
            className={FIELD}
          />
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Teléfono (opcional)"
            inputMode="tel"
            className={FIELD}
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Correo (opcional)"
            inputMode="email"
            className={FIELD}
          />
          {createError && (
            <p role="alert" className="font-sans text-sm text-muted-rose-dark">
              {createError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                creatingRef.current = false;
                setCreating(false);
              }}
              disabled={savingNew}
              className="h-12 flex-1 rounded-2xl border border-cream-deep font-sans text-sm tracking-[0.06em] uppercase text-charcoal-light active:bg-cream-mid disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveNewClient}
              disabled={savingNew}
              className="h-12 flex-1 rounded-2xl bg-muted-rose font-sans text-sm tracking-[0.06em] uppercase text-cream-soft active:bg-muted-rose-dark disabled:opacity-60"
            >
              {savingNew ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {selected.id === null && !initial.name && (
        <p className="font-sans text-xs text-charcoal-light">
          Busca y elige una clienta, o crea una nueva.
        </p>
      )}

      <input type="hidden" name="clientName" value={selected.name} />
      <input type="hidden" name="clientPhone" value={selected.phone} />
      <input type="hidden" name="clientEmail" value={selected.email} />
    </div>
  );
}

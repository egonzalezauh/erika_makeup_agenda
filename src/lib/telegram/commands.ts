import { guayaquilDateString } from "@/lib/dates";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatusAction = "confirmar" | "cancelar" | "completar" | "reabrir";

export type AgendarFields = {
  servicio?: string;
  fecha?: string;
  hora?: string;
  nombre?: string;
  telefono?: string;
  email?: string;
  notas?: string;
};

export type ParsedCommand =
  | { type: "ayuda" }
  | { type: "servicios" }
  | { type: "citas"; date: string; label: string }
  | { type: "status_change"; action: StatusAction; query: string }
  | { type: "agendar"; fields: AgendarFields; errors: string[] }
  | { type: "unknown"; raw: string };

export const HELP_TEXT = `Comandos disponibles:

• ayuda — muestra este mensaje
• servicios — lista los servicios y precios
• citas hoy / citas mañana / citas YYYY-MM-DD — citas de ese día
• confirmar <nombre> — confirma una cita pendiente
• cancelar <nombre> — cancela una cita
• completar <nombre> — marca una cita como completada
• reabrir <nombre> — vuelve una cita a pendiente
• agendar — crea una cita nueva, ejemplo:

agendar
servicio: Maquillaje de novia
fecha: 2026-08-15
hora: 14:00
nombre: Maria Lopez
telefono: 0991234567`;

const STATUS_ACTIONS: StatusAction[] = ["confirmar", "cancelar", "completar", "reabrir"];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const AGENDAR_LABELS: Record<string, keyof AgendarFields> = {
  servicio: "servicio",
  fecha: "fecha",
  hora: "hora",
  nombre: "nombre",
  telefono: "telefono",
  email: "email",
  notas: "notas",
};

const AGENDAR_REQUIRED: (keyof AgendarFields)[] = [
  "servicio",
  "fecha",
  "hora",
  "nombre",
  "telefono",
];

// ── Parser ────────────────────────────────────────────────────────────────────

export function parseCommand(text: string): ParsedCommand {
  const trimmed = text.trim();
  const firstLine = trimmed.split("\n")[0].trim().toLowerCase();

  if (firstLine === "ayuda" || firstLine === "help") {
    return { type: "ayuda" };
  }

  if (firstLine === "servicios") {
    return { type: "servicios" };
  }

  if (firstLine === "citas hoy") {
    return { type: "citas", date: guayaquilDateString(0), label: "hoy" };
  }

  if (firstLine === "citas mañana" || firstLine === "citas manana") {
    return { type: "citas", date: guayaquilDateString(1), label: "mañana" };
  }

  const citasDateMatch = firstLine.match(/^citas\s+(\d{4}-\d{2}-\d{2})$/);
  if (citasDateMatch) {
    return { type: "citas", date: citasDateMatch[1], label: citasDateMatch[1] };
  }

  if (firstLine.startsWith("agendar")) {
    return parseAgendar(trimmed);
  }

  for (const action of STATUS_ACTIONS) {
    if (firstLine.startsWith(action)) {
      const query = trimmed.slice(action.length).trim();
      return { type: "status_change", action, query };
    }
  }

  return { type: "unknown", raw: text };
}

function parseAgendar(block: string): ParsedCommand {
  const lines = block.split("\n").slice(1); // drop the "agendar" line itself
  const fields: AgendarFields = {};

  for (const line of lines) {
    const match = line.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/);
    if (!match) continue;
    const label = AGENDAR_LABELS[match[1].toLowerCase()];
    if (label) fields[label] = match[2];
  }

  const errors: string[] = [];
  for (const req of AGENDAR_REQUIRED) {
    if (!fields[req]) errors.push(`falta "${req}"`);
  }
  if (fields.fecha && !DATE_RE.test(fields.fecha)) {
    errors.push('"fecha" debe tener el formato YYYY-MM-DD');
  }
  if (fields.hora && !/^\d{2}:\d{2}$/.test(fields.hora)) {
    errors.push('"hora" debe tener el formato HH:MM');
  }

  return { type: "agendar", fields, errors };
}

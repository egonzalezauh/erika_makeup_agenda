// Validación de datos en tiempo de ejecución.
//
// Los tipos de TypeScript desaparecen al compilar: no protegen nada en el
// servidor. Estos esquemas sí corren en producción y son la única barrera
// real entre lo que llega por la red y lo que se guarda en la base.
//
// Se aplican en `actions/admin.ts` y `actions/clients.ts`, que son los únicos
// puntos donde datos del navegador entran a la capa de escritura.

import { z } from "zod";
import { BUSINESS_TIME_SLOTS } from "@/lib/time";

// ─── Piezas reutilizables ─────────────────────────────────────────

const uuid = z.uuid("Identificador inválido.");

// `z.iso.date()` ya valida tanto el formato AAAA-MM-DD como que la fecha
// exista de verdad (rechaza 2026-02-30). El refine es una red de seguridad
// por si esa garantía cambia: re-arma la fecha y comprueba que JavaScript no
// la haya corrido a otro día.
const businessDate = z
  .iso.date("La fecha debe tener el formato AAAA-MM-DD y existir en el calendario.")
  .refine((value) => {
    const parsed = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
  }, "Esa fecha no existe en el calendario.");

// Solo horarios reales del negocio. Un valor libre como "abc" volvería NaN en
// timeToMinutes() y desactivaría la detección de citas que chocan.
const timeSlot = z
  .string()
  .refine((value) => BUSINESS_TIME_SLOTS.includes(value), "Ese horario no es válido.");

const clientName = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio.")
  .max(120, "El nombre es demasiado largo.");

// El formulario manda cadena vacía cuando no se registra correo, y la columna
// de la base es obligatoria — así que la cadena vacía es un valor legítimo.
const clientEmail = z.union([
  z.literal(""),
  z.email("El correo no es válido.").max(200),
]);

const clientPhone = z.string().trim().max(30, "El teléfono es demasiado largo.");

const notes = z.string().max(2000, "Las notas son demasiado largas.").optional();

export const APPOINTMENT_STATUSES = [
  "PENDIENTE",
  "CONFIRMADA",
  "CANCELADA",
  "COMPLETADA",
  "ELIMINADA",
] as const;

// Al crear una cita, ELIMINADA no es un estado de partida válido: nacer ya
// borrada no tiene sentido. Solo se llega a ese estado con updateStatus.
const CREATABLE_STATUSES = [
  "PENDIENTE",
  "CONFIRMADA",
  "CANCELADA",
  "COMPLETADA",
] as const;

// ─── Esquemas de citas ────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  clientName,
  clientEmail,
  clientPhone,
  date: businessDate,
  timeSlot,
  serviceId: uuid,
  notes,
  status: z.enum(CREATABLE_STATUSES, "Ese estado de cita no existe.").optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.omit({ status: true });

export const appointmentStatusSchema = z.object({
  id: uuid,
  status: z.enum(APPOINTMENT_STATUSES, "Ese estado de cita no existe."),
  amountEarned: z
    .number("El monto debe ser un número.")
    .finite("El monto no es un número válido.")
    .min(0, "El monto no puede ser negativo.")
    .max(1_000_000, "El monto es demasiado alto.")
    .optional(),
});

// ─── Esquemas de clientas ─────────────────────────────────────────

export const clientSchema = z.object({
  name: clientName,
  phone: clientPhone.optional(),
  email: clientEmail.optional(),
  notes,
});

export const clientIdSchema = uuid;

// ─── Ayuda para reportar errores ──────────────────────────────────

// Devuelve el primer mensaje de error legible, para mostrarlo tal cual en el
// formulario. No expone la ruta interna del campo ni el valor recibido.
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Los datos enviados no son válidos.";
}

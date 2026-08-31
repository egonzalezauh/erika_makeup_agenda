// Capa de acceso a datos de citas.
//
// Este archivo NO lleva "use server" a propósito, y no debe llevarlo nunca.
// Toda función exportada desde un archivo "use server" queda accesible como
// endpoint HTTP desde cualquier página que importe el archivo — incluidas las
// públicas (/, /booking, /calendario), que `proxy.ts` no protege. Basta con
// que una sola página pública use una sola función para exponer las demás.
//
// Al ser funciones normales, solo se pueden llamar desde el servidor. Las
// escrituras se exponen al navegador únicamente vía `actions/admin.ts`, que
// exige sesión de administradora con `requireAdmin()`.

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { timeToMinutes, minutesToTime } from "@/lib/time";

// ─── Tipos de entrada ────────────────────────────────────────────

export type CreateAppointmentInput = {
  clientName:  string;
  clientEmail: string;
  clientPhone: string;
  date:        string; // ISO date "YYYY-MM-DD"
  timeSlot:    string; // "HH:mm"
  serviceId:   string;
  notes?:      string;
  status?:     "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
};

export type UpdateAppointmentInput = {
  clientName:  string;
  clientEmail: string;
  clientPhone: string;
  date:        string; // ISO date "YYYY-MM-DD"
  timeSlot:    string; // "HH:mm"
  serviceId:   string;
  notes?:      string;
};

// Estados que no ocupan horario ni aparecen en el panel: CANCELADA sigue
// siendo visible (colapsada) para poder reabrirla; ELIMINADA es la misma
// idea pero invisible del todo — "borrar" una cita solo le pone este estado,
// nunca se hace un delete real en la base.
const INACTIVE_STATUSES = ["CANCELADA", "ELIMINADA"];

// ─── Solapamiento de horarios ──────────────────────────────────────
// Una cita ocupa [timeSlot, timeSlot + service.duration), no solo el minuto
// exacto en que empieza. Antes de crear o reactivar una cita hay que
// verificar que ese rango no choque con ninguna otra cita activa (cualquier
// estado salvo CANCELADA/ELIMINADA) ese mismo día.

async function findConflictingAppointment(
  date: string,
  timeSlot: string,
  durationMinutes: number,
  excludeAppointmentId?: string
) {
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  const sameDay = await prisma.appointment.findMany({
    where: {
      date: { gte: start, lt: end },
      status: { notIn: INACTIVE_STATUSES },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
    include: { service: true },
  });

  const newStart = timeToMinutes(timeSlot);
  const newEnd = newStart + durationMinutes;

  return (
    sameDay.find((appt) => {
      const existingStart = timeToMinutes(appt.timeSlot);
      const existingEnd = existingStart + appt.service.duration;
      return newStart < existingEnd && existingStart < newEnd;
    }) ?? null
  );
}

function describeConflict(conflict: { clientName: string; timeSlot: string; service: { name: string; duration: number } }) {
  const endTime = minutesToTime(timeToMinutes(conflict.timeSlot) + conflict.service.duration);
  return `${conflict.clientName} (${conflict.service.name}) de ${conflict.timeSlot} a ${endTime}`;
}

// ─── Acciones ────────────────────────────────────────────────────

export async function createAppointment(
  data: CreateAppointmentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) {
      return { success: false, error: "Servicio no encontrado." };
    }

    const conflict = await findConflictingAppointment(data.date, data.timeSlot, service.duration);
    if (conflict) {
      return {
        success: false,
        error: `Ese horario choca con la cita de ${describeConflict(conflict)}. Elige otro horario.`,
      };
    }

    await prisma.appointment.create({
      data: {
        clientName:  data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        date:        new Date(data.date),
        timeSlot:    data.timeSlot,
        serviceId:   data.serviceId,
        notes:       data.notes,
        status:      data.status ?? "PENDIENTE",
      },
    });

    revalidatePath("/calendario");
    return { success: true };
  } catch (err) {
    console.error("[createAppointment]", err);
    return { success: false, error: "No se pudo guardar la cita." };
  }
}

// Citas activas desde `today` en adelante (sin límite superior — lo que
// hay agendado a futuro es naturalmente acotado). Alimenta /admin/agenda.
export async function getUpcomingAppointments(today: string) {
  return prisma.appointment.findMany({
    where: { date: { gte: new Date(today) }, status: { not: "ELIMINADA" } },
    include: { service: true },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });
}

// Citas de días anteriores que nunca se resolvieron (ni se completaron ni
// se cancelaron) — no aparecen en Agenda (filtra date >= hoy) ni en Hoy
// (solo el día actual), así que sin esto se pierden de vista. Acotada por
// status, así que en la práctica son pocas filas.
export async function getOverdueAppointments(today: string) {
  return prisma.appointment.findMany({
    where: {
      date: { lt: new Date(today) },
      status: { in: ["PENDIENTE", "CONFIRMADA"] },
    },
    include: { service: true },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });
}

// Adelanto de "esta semana" en la pestaña Hoy — solo los campos que
// necesita UpcomingPreview, acotado a la semana (no toda la historia).
export async function getUpcomingAppointmentsInRange(
  fromExclusive: string,
  toInclusive: string
) {
  const start = new Date(fromExclusive);
  const end = new Date(toInclusive);
  end.setDate(end.getDate() + 1); // toInclusive incluido

  return prisma.appointment.findMany({
    where: {
      date: { gt: start, lt: end },
      status: { notIn: INACTIVE_STATUSES },
    },
    select: { id: true, date: true, timeSlot: true, clientName: true },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });
}

// Conteo de "resto del mes" en Hoy — solo el número, sin traer filas.
export async function countAppointmentsInRange(
  fromExclusive: string,
  toInclusive: string
) {
  const start = new Date(fromExclusive);
  const end = new Date(toInclusive);
  end.setDate(end.getDate() + 1); // toInclusive incluido

  return prisma.appointment.count({
    where: {
      date: { gt: start, lt: end },
      status: { notIn: INACTIVE_STATUSES },
    },
  });
}

// Citas completadas del año dado, con su monto — alimenta la pestaña
// Ingresos. Solo trae date/amountEarned (no el servicio, que esa pestaña
// no usa).
export async function getCompletedAppointmentsInYear(year: string) {
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${Number(year) + 1}-01-01`);

  return prisma.appointment.findMany({
    where: { status: "COMPLETADA", date: { gte: start, lt: end } },
    select: { date: true, amountEarned: true },
    orderBy: [{ date: "asc" }],
  });
}

// Public read-only availability — no client PII (name/email/phone/notes)
// leaves this query. Used by the public /calendario page.
export async function getPublicAppointmentAvailability() {
  return prisma.appointment.findMany({
    where: { status: { notIn: INACTIVE_STATUSES } },
    select: {
      date: true,
      timeSlot: true,
      status: true,
      service: { select: { name: true, duration: true } },
    },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });
}

export async function getAppointmentsByDate(date: string) {
  const start = new Date(date);
  const end   = new Date(date);
  end.setDate(end.getDate() + 1);

  return prisma.appointment.findMany({
    where: { date: { gte: start, lt: end }, status: { not: "ELIMINADA" } },
    include: { service: true },
    orderBy: { timeSlot: "asc" },
  });
}

export async function updateAppointmentStatus(
  id:           string,
  status:       "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA" | "ELIMINADA",
  amountEarned?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Reabrir una cita cancelada la vuelve a poner activa — hay que revisar
    // que el horario no se haya ocupado con otra cita mientras tanto. Pasar
    // a CANCELADA o ELIMINADA nunca necesita este chequeo: ninguna de las
    // dos ocupa horario.
    if (!INACTIVE_STATUSES.includes(status)) {
      const current = await prisma.appointment.findUnique({
        where: { id },
        include: { service: true },
      });
      if (!current) {
        return { success: false, error: "Cita no encontrada." };
      }
      if (INACTIVE_STATUSES.includes(current.status)) {
        const dateStr = current.date.toISOString().split("T")[0];
        const conflict = await findConflictingAppointment(
          dateStr,
          current.timeSlot,
          current.service.duration,
          id
        );
        if (conflict) {
          return {
            success: false,
            error: `No se puede reabrir: choca con la cita de ${describeConflict(conflict)}.`,
          };
        }
      }
    }

    await prisma.appointment.update({
      where: { id },
      data:  {
        status,
        ...(status === "COMPLETADA" && amountEarned !== undefined
          ? { amountEarned }
          : {}),
      },
    });

    revalidatePath("/calendario");
    return { success: true };
  } catch (err) {
    console.error("[updateAppointmentStatus]", err);
    return { success: false, error: "No se pudo actualizar el estado." };
  }
}

export async function getAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { service: true },
  });
}

// Edita los datos de una cita, incluido reprogramarla a otra fecha u hora
// o cambiarle el servicio. El estado no se toca aquí — para eso está
// `updateAppointmentStatus`.
//
// La verificación de solapamiento se excluye a sí misma: si no, guardar una
// cita sin moverle el horario chocaría contra su propio registro.
export async function updateAppointment(
  id:   string,
  data: UpdateAppointmentInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Cita no encontrada." };
    }

    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) {
      return { success: false, error: "Servicio no encontrado." };
    }

    // Una cita cancelada o eliminada no ocupa horario, así que tampoco puede chocar.
    if (!INACTIVE_STATUSES.includes(existing.status)) {
      const conflict = await findConflictingAppointment(
        data.date,
        data.timeSlot,
        service.duration,
        id
      );
      if (conflict) {
        return {
          success: false,
          error: `Ese horario choca con la cita de ${describeConflict(conflict)}. Elige otro horario.`,
        };
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        clientName:  data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        date:        new Date(data.date),
        timeSlot:    data.timeSlot,
        serviceId:   data.serviceId,
        notes:       data.notes ?? null,
      },
    });

    revalidatePath("/calendario");
    return { success: true };
  } catch (err) {
    console.error("[updateAppointment]", err);
    return { success: false, error: "No se pudo guardar los cambios." };
  }
}

// ─── Servicios ────────────────────────────────────────────────────

// Trae todos los servicios, incluidos los que solo debe ver la dueña.
// Usado por /admin/nueva y /admin/cita/[id] — ninguno de cara al público.
export async function getServices() {
  return prisma.service.findMany({
    orderBy: { name: "asc" },
  });
}

// Servicios que no deben ofrecerse en la web pública: existen en la base y
// se pueden agendar desde el panel, pero no tienen sentido para un cliente
// que reserva por su cuenta (p. ej. porque son una variante interna).
const ADMIN_ONLY_SERVICE_NAMES = ["Maquillaje Social"];

// Misma lista que getServices(), sin los servicios solo-admin. Usado por
// las páginas públicas (home, /booking).
export async function getPublicServices() {
  const services = await getServices();
  return services.filter((s) => !ADMIN_ONLY_SERVICE_NAMES.includes(s.name));
}

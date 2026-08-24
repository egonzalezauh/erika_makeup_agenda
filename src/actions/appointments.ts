"use server";

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

// ─── Solapamiento de horarios ──────────────────────────────────────
// Una cita ocupa [timeSlot, timeSlot + service.duration), no solo el minuto
// exacto en que empieza. Antes de crear o reactivar una cita hay que
// verificar que ese rango no choque con ninguna otra cita activa (cualquier
// estado salvo CANCELADA) ese mismo día.

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
      status: { not: "CANCELADA" },
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

export async function getAppointments() {
  return prisma.appointment.findMany({
    include: { service: true },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });
}

// Public read-only availability — no client PII (name/email/phone/notes)
// leaves this query. Used by the public /calendario page.
export async function getPublicAppointmentAvailability() {
  return prisma.appointment.findMany({
    where: { status: { not: "CANCELADA" } },
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
    where: { date: { gte: start, lt: end } },
    include: { service: true },
    orderBy: { timeSlot: "asc" },
  });
}

// Case-insensitive partial match on clientName — used by the Telegram bot
// to resolve "confirmar/cancelar/completar/reabrir <texto>" commands.
// Filtered in JS (not via Prisma's `mode: "insensitive"`) so this works
// identically on both SQLite (dev) and PostgreSQL (prod) — SQLite's Prisma
// connector doesn't support query-level case-insensitive filters.
export async function searchAppointmentsByClientName(query: string) {
  const needle = query.trim().toLowerCase();
  const all = await prisma.appointment.findMany({
    include: { service: true },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });
  return all.filter((a) => a.clientName.toLowerCase().includes(needle));
}

export async function updateAppointmentStatus(
  id:     string,
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Reabrir una cita cancelada la vuelve a poner activa — hay que revisar
    // que el horario no se haya ocupado con otra cita mientras tanto.
    if (status !== "CANCELADA") {
      const current = await prisma.appointment.findUnique({
        where: { id },
        include: { service: true },
      });
      if (!current) {
        return { success: false, error: "Cita no encontrada." };
      }
      if (current.status === "CANCELADA") {
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
      data:  { status },
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

    // Una cita cancelada no ocupa horario, así que tampoco puede chocar.
    if (existing.status !== "CANCELADA") {
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

export async function getServices() {
  return prisma.service.findMany({
    orderBy: { name: "asc" },
  });
}

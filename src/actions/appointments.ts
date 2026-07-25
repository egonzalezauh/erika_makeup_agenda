"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

// ─── Acciones ────────────────────────────────────────────────────

export async function createAppointment(
  data: CreateAppointmentInput
): Promise<{ success: boolean; error?: string }> {
  try {
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
      service: { select: { name: true } },
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

// ─── Servicios ────────────────────────────────────────────────────

export async function getServices() {
  return prisma.service.findMany({
    orderBy: { name: "asc" },
  });
}

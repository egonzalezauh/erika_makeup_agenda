"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/auth";
import {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
} from "@/actions/appointments";

// Envoltorios autenticados de las acciones de datos.
//
// `appointments.ts` sigue siendo la capa de acceso a datos y no valida
// sesión, porque el webhook de Telegram la usa con su propia autenticación
// (secret header + whitelist de chat IDs). El panel /admin entra por aquí,
// donde cada escritura exige cookie de administradora antes de tocar la BD.

export async function adminUpdateAppointmentStatus(
  id: string,
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA" | "ELIMINADA"
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const result = await updateAppointmentStatus(id, status);
  if (result.success) revalidatePath("/admin", "layout");
  return result;
}

export async function adminCreateAppointment(
  data: CreateAppointmentInput
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const result = await createAppointment(data);
  if (result.success) revalidatePath("/admin", "layout");
  return result;
}

export async function adminUpdateAppointment(
  id:   string,
  data: UpdateAppointmentInput
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const result = await updateAppointment(id, data);
  if (result.success) revalidatePath("/admin", "layout");
  return result;
}

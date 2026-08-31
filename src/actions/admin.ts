"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/auth";
import {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
} from "@/lib/appointments-data";
import {
  appointmentStatusSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  firstIssue,
} from "@/lib/schemas";

// Único punto por donde el navegador puede escribir citas.
//
// La capa de datos (`lib/appointments-data.ts`) son funciones normales de
// servidor, no Server Actions: no existen como endpoint HTTP. Todo lo que el
// cliente puede invocar pasa por aquí, y aquí se hacen las dos comprobaciones
// que la capa de datos no hace — sesión y validación de los datos.
//
// Si agregas una acción que escribe, va en este archivo y empieza por
// requireAdmin(). No pongas "use server" en los archivos de lib/.

export async function adminUpdateAppointmentStatus(
  id: string,
  status: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA" | "ELIMINADA",
  amountEarned?: number
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const parsed = appointmentStatusSchema.safeParse({ id, status, amountEarned });
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
  }

  const result = await updateAppointmentStatus(
    parsed.data.id,
    parsed.data.status,
    parsed.data.amountEarned
  );
  if (result.success) revalidatePath("/admin", "layout");
  return result;
}

export async function adminCreateAppointment(
  data: CreateAppointmentInput
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const parsed = createAppointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
  }

  const result = await createAppointment(parsed.data);
  if (result.success) revalidatePath("/admin", "layout");
  return result;
}

export async function adminUpdateAppointment(
  id:   string,
  data: UpdateAppointmentInput
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const parsedId = appointmentStatusSchema.shape.id.safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: firstIssue(parsedId.error) };
  }

  const parsed = updateAppointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
  }

  const result = await updateAppointment(parsedId.data, parsed.data);
  if (result.success) revalidatePath("/admin", "layout");
  return result;
}

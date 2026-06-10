"use server";

import type { Appointment } from "@/types";

// Placeholder — se implementará con la BD en el siguiente paso
export async function createAppointment(
  _data: Omit<Appointment, "id" | "status" | "createdAt">
): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

export async function getAppointments(): Promise<Appointment[]> {
  return [];
}

export async function updateAppointmentStatus(
  _id: string,
  _status: Appointment["status"]
): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

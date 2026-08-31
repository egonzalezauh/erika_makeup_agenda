"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/auth";

// Solo lo usa el panel /admin — a diferencia de appointments.ts, no hay
// un segundo consumidor sin sesión (el bot de Telegram no toca clientas),
// así que las escrituras validan admin directo acá en vez de un archivo
// admin.ts aparte que envuelva esto.

export type CreateClientInput = {
  name:  string;
  phone?: string;
  email?: string;
  notes?: string;
};

export type UpdateClientInput = CreateClientInput;

export async function getClients() {
  return prisma.client.findMany({ orderBy: { name: "asc" } });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

export async function createClient(
  data: CreateClientInput
): Promise<{ success: boolean; error?: string; client?: { id: string; name: string; phone: string | null; email: string | null } }> {
  try {
    await requireAdmin();

    const client = await prisma.client.create({
      data: {
        name:  data.name,
        phone: data.phone || null,
        email: data.email || null,
        notes: data.notes || null,
      },
    });

    revalidatePath("/admin", "layout");
    return { success: true, client };
  } catch (err) {
    console.error("[createClient]", err);
    return { success: false, error: "No se pudo guardar la clienta." };
  }
}

export async function updateClient(
  id:   string,
  data: UpdateClientInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Clienta no encontrada." };
    }

    await prisma.client.update({
      where: { id },
      data: {
        name:  data.name,
        phone: data.phone || null,
        email: data.email || null,
        notes: data.notes || null,
      },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err) {
    console.error("[updateClient]", err);
    return { success: false, error: "No se pudo guardar los cambios." };
  }
}

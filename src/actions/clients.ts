"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/auth";
import { clientIdSchema, clientSchema, firstIssue } from "@/lib/schemas";

// Escrituras del catálogo de clientas, invocadas desde ClientForm y
// ClientPicker (componentes de navegador). Las lecturas viven en
// `lib/clients-data.ts` como funciones normales, para no publicarlas como
// endpoint HTTP.
//
// requireAdmin() va FUERA del try: si quedara dentro, su excepción caería en
// el catch y la denegación de acceso se mostraría como un error de guardado.

export type CreateClientInput = {
  name:  string;
  phone?: string;
  email?: string;
  notes?: string;
};

export type UpdateClientInput = CreateClientInput;

export async function createClient(
  data: CreateClientInput
): Promise<{ success: boolean; error?: string; client?: { id: string; name: string; phone: string | null; email: string | null } }> {
  await requireAdmin();

  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
  }

  try {
    const client = await prisma.client.create({
      data: {
        name:  parsed.data.name,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
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
  await requireAdmin();

  const parsedId = clientIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { success: false, error: firstIssue(parsedId.error) };
  }

  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstIssue(parsed.error) };
  }

  try {
    const existing = await prisma.client.findUnique({ where: { id: parsedId.data } });
    if (!existing) {
      return { success: false, error: "Clienta no encontrada." };
    }

    await prisma.client.update({
      where: { id: parsedId.data },
      data: {
        name:  parsed.data.name,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err) {
    console.error("[updateClient]", err);
    return { success: false, error: "No se pudo guardar los cambios." };
  }
}

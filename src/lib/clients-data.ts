// Lecturas del catálogo de clientas.
//
// Igual que `appointments-data.ts`, este archivo NO lleva "use server" y no
// debe llevarlo: eso convertiría a getClients() en un endpoint HTTP capaz de
// devolver nombre, teléfono, correo y notas de todas las clientas a quien lo
// llame. Solo se invoca desde páginas del panel, que ya corren en el servidor.

import { prisma } from "@/lib/prisma";

export async function getClients() {
  return prisma.client.findMany({ orderBy: { name: "asc" } });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

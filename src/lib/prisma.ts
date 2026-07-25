import { PrismaClient } from "@prisma/client";

/*
 * Patrón singleton para Next.js dev:
 * El hot-reload crea nuevos módulos en cada cambio, lo que instanciaría
 * un PrismaClient nuevo en cada recarga y agotaría el pool de conexiones.
 * Guardamos la instancia en `globalThis` para reutilizarla entre recargas.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

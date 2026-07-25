import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();

  const [social, quince, novia] = await Promise.all([
    prisma.service.create({
      data: {
        name: "Maquillaje y Peinado Social",
        duration: 75,
        price: 60.0,
        description:
          "Incluye preparación de piel, pestañas de banda, peinado semi recogido con ondas y maquillaje de larga duración.",
      },
    }),
    prisma.service.create({
      data: {
        name: "Maquillaje y Peinado de Quinceañera",
        duration: 90,
        price: 95.0,
        description:
          "Incluye preparación de piel, pestañas en banda o individuales, peinado a elección recogido o semi-recogido con ondas, maquillaje blindado.",
      },
    }),
    prisma.service.create({
      data: {
        name: "Maquillaje y Peinado de Novia",
        duration: 120,
        price: 150.0,
        description:
          "Preparación de piel con mascarilla hidratante, peinado a elección (tocado y velo aplicado), pestañas postizas. Productos de alta gama con técnica de blindaje o aerógrafo.",
      },
    }),
  ]);

  console.log("✅ Servicios creados:");
  for (const s of [social, quince, novia]) {
    console.log(`   • ${s.name} — $${s.price} / ${s.duration} min`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

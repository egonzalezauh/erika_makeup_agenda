import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();

  const [social, quince, novia, artistico, curso] = await Promise.all([
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
          "Incluye preparación de piel, pestañas en banda o individuales, peinado a elección recogido o semi-recogido con ondas, maquillaje de larga duración.",
      },
    }),
    prisma.service.create({
      data: {
        name: "Maquillaje y Peinado de Novia",
        duration: 120,
        price: 150.0,
        description:
          "Preparación de piel (incluye mascarilla hidratante), pestañas individuales, productos de alta gama con técnica de blindaje para una larga duración; puedes elegir la técnica con aerógrafo. Peinado a tu elección (te dejamos aplicado el velo y el tocado).",
      },
    }),
    prisma.service.create({
      data: {
        name: "Maquillaje Artístico",
        duration: 120,
        price: 60.0,
        description:
          "Convierte tu idea en una obra de arte. El maquillaje artístico está diseñado para quienes buscan impactar y expresar creatividad a través de diseños únicos y personalizados. Ideal para sesiones fotográficas, producciones audiovisuales, eventos temáticos, Halloween, editoriales y presentaciones de baile.",
      },
    }),
    prisma.service.create({
      data: {
        name: "Curso de Automaquillaje",
        duration: 240,
        price: 50.0,
        description:
          "Aprende a maquillarte con tus propias manos: preparación de piel, corrección, contorno, ojos y aplicación de pestañas, con técnicas profesionales adaptadas a tu rostro. Sesión práctica, con productos de alta gama incluidos.",
      },
    }),
  ]);

  console.log("✅ Servicios creados:");
  for (const s of [social, quince, novia, artistico, curso]) {
    console.log(`   • ${s.name} — $${s.price} / ${s.duration} min`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

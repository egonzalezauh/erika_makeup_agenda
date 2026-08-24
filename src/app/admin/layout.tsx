import type { Metadata, Viewport } from "next";

// Layout raíz de la zona privada: metadatos y viewport que comparten el
// panel y el login. El shell con la barra de navegación vive en
// `(panel)/layout.tsx` para que la pantalla de login no la muestre —
// ahí todavía no hay sesión y los tabs no llevarían a ningún lado.
export const metadata: Metadata = {
  // `absolute` corta la plantilla "%s | Erika Auhing" del layout raíz: en la
  // app instalada el nombre del negocio sobra, ella ya sabe de quién es.
  title: { absolute: "Mi agenda", template: "%s | Mi agenda" },
  // El panel nunca debe aparecer en Google: es la zona privada.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#F6F1E9",
  // Sin zoom al tocar los campos — el panel ya está dimensionado para
  // dedos, y el auto-zoom de iOS/Android descuadra la pantalla.
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

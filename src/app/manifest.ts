import type { MetadataRoute } from "next";

// Hace la app instalable en el celular: ícono en la pantalla de inicio y
// apertura a pantalla completa, sin barra de navegador. Es también la base
// sobre la que se empaqueta el .apk para Android.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Erika Auhing · Mi agenda",
    short_name: "Mi agenda",
    description: "Agenda de citas de Erika Auhing Makeup.",
    // Al tocar el ícono entra directo al panel, no a la web pública.
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F1E9",
    theme_color: "#F6F1E9",
    lang: "es-EC",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

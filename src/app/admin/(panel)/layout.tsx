import { redirect } from "next/navigation";
import BottomNav from "@/components/admin/BottomNav";
import { isAdmin } from "@/actions/auth";

// Shell del panel autenticado: contenedor angosto centrado + barra de
// navegación inferior. El login queda fuera de este grupo a propósito.
//
// La verificación de sesión aquí es deliberadamente redundante con
// `proxy.ts`. El proxy es un único punto de fallo — y saltárselo ha sido una
// vulnerabilidad real de Next.js más de una vez. Este segundo candado corre
// dentro del render, así que aunque el proxy no llegue a ejecutarse, ninguna
// página del panel llega a consultar datos de clientas.
export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-cream-soft">
      {/* pb-28 deja aire para la barra inferior fija */}
      <div className="mx-auto w-full max-w-lg px-5 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

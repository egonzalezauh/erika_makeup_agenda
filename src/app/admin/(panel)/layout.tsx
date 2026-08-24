import BottomNav from "@/components/admin/BottomNav";

// Shell del panel autenticado: contenedor angosto centrado + barra de
// navegación inferior. El login queda fuera de este grupo a propósito.
export default function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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

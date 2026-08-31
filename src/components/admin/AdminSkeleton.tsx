import { cn } from "@/lib/utils";

// Bloque base para armar skeletons: mismo pulso, distinto tamaño por caso.
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-cream-deep/50", className)} />;
}

// Misma silueta que AppointmentCard — usado en Hoy y Agenda mientras
// cargan las citas reales.
export function SkeletonAppointmentCard() {
  return (
    <div className="rounded-3xl border border-cream-deep bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <SkeletonBlock className="h-7 w-16" />
        <SkeletonBlock className="h-7 w-20 rounded-full" />
      </div>
      <SkeletonBlock className="mt-4 h-5 w-2/3" />
      <SkeletonBlock className="mt-2 h-4 w-1/3" />
      <div className="mt-4 flex gap-2">
        <SkeletonBlock className="h-12 flex-1 rounded-2xl" />
        <SkeletonBlock className="h-12 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}

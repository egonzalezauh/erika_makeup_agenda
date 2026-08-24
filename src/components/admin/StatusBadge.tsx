import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  PENDIENTE:  "bg-gold-light text-gold-dark",
  CONFIRMADA: "bg-muted-rose-light text-muted-rose-dark",
  COMPLETADA: "bg-cream-deep text-charcoal-mid",
  CANCELADA:  "bg-cream-mid text-charcoal-light line-through",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 font-sans text-[0.6rem] tracking-[0.16em] uppercase",
        STYLES[status] ?? STYLES.PENDIENTE
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

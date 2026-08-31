import { formatCurrency } from "@/lib/utils";

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

// Etiqueta corta para no desbordar columnas angostas: sin decimales
// cuando el monto es un entero, con centavos solo si los tiene.
function compactCurrency(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

// Las barras nunca ocupan el 100% del alto disponible — se deja un 20%
// de aire arriba para que la etiqueta del monto quepa sin desbordarse.
const BAR_MAX_HEIGHT_PCT = 80;

// Barras hechas a mano (sin librería) — un valor por mes del año en
// curso. Se renderiza en el servidor, como el resto del panel, porque
// no necesita interacción.
export default function RevenueChart({ monthly }: { monthly: number[] }) {
  const max = Math.max(...monthly, 0);

  if (max === 0) {
    return (
      <div className="mt-4 rounded-3xl border border-dashed border-cream-deep px-6 py-12 text-center">
        <p className="font-serif text-xl text-charcoal-mid">
          Aún no hay ingresos
        </p>
        <p className="mt-2 font-sans text-sm text-charcoal-light">
          Cuando completes citas con un monto, su evolución mensual va a
          aparecer acá.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-3xl border border-cream-deep bg-white p-5">
      <div className="flex h-40 items-end gap-1.5 sm:gap-2">
        {monthly.map((value, i) => (
          <div
            key={i}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            title={`${MONTH_LABELS[i]}: ${formatCurrency(value)}`}
          >
            {value > 0 && (
              <span className="whitespace-nowrap font-sans text-[0.55rem] text-charcoal-mid">
                {compactCurrency(value)}
              </span>
            )}
            <div
              className="w-full rounded-t-md bg-muted-rose"
              style={{ height: `${(value / max) * BAR_MAX_HEIGHT_PCT}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {MONTH_LABELS.map((label) => (
          <span
            key={label}
            className="flex-1 text-center font-sans text-[0.6rem] uppercase text-charcoal-light"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";

// ── Constants ─────────────────────────────────────────────────────────────────

export const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ── Calendar helpers ──────────────────────────────────────────────────────────

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ── Calendar Grid ─────────────────────────────────────────────────────────────

export interface CalendarGridProps {
  year: number;
  month: number;
  today: Date;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isDateDisabled: (year: number, month: number, day: number) => boolean;
  /** optional per-day annotation, keyed by "YYYY-MM-DD" — used to show "N ocupado" badges */
  dayAnnotations?: Record<string, { busyCount: number }>;
}

export function CalendarGrid({
  year,
  month,
  today,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  isDateDisabled,
  dayAnnotations,
}: CalendarGridProps) {
  const numDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const canGoPrev = !(
    year === today.getFullYear() && month === today.getMonth()
  );

  // Build grid: leading nulls + day numbers, padded to multiple of 7
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-cream-mid rounded-2xl p-5 border border-cream-deep">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-deep transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed text-charcoal-mid text-lg"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="font-medium text-sm text-dark-charcoal">
          {MONTHS_ES[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-deep transition-colors text-charcoal-mid text-lg"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_ES.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-charcoal-light py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const dateStr = toDateStr(year, month, day);
          const disabled = isDateDisabled(year, month, day);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const busyCount = dayAnnotations?.[dateStr]?.busyCount ?? 0;

          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onSelectDate(dateStr)}
              className={`relative aspect-square rounded-lg text-sm flex items-center justify-center transition-all duration-150
                ${
                  disabled
                    ? "text-cream-deep cursor-not-allowed"
                    : isSelected
                    ? "bg-muted-rose text-white font-semibold shadow-sm"
                    : isToday
                    ? "border-2 border-muted-rose text-muted-rose font-semibold hover:bg-muted-rose-light/30"
                    : "text-dark-charcoal hover:bg-cream-deep"
                }`}
            >
              {day}
              {busyCount > 0 && !disabled && (
                <span
                  className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-muted-rose"
                  }`}
                  aria-label={`${busyCount} ocupado(s)`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

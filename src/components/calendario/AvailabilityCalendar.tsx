"use client";

import { useMemo, useState } from "react";
import {
  CalendarGrid,
  formatDisplayDate,
} from "@/components/shared/CalendarGrid";

type PublicAppointment = {
  date: Date;
  timeSlot: string;
  status: string;
  service: { name: string };
};

// Dates arrive as UTC-midnight ISO strings from Prisma/Next.js serialization.
// Parsing them directly as local time avoids timezone day-shifts.
function toDateKey(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}

export function AvailabilityCalendar({
  appointments,
}: {
  appointments: PublicAppointment[];
}) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map: Record<string, PublicAppointment[]> = {};
    for (const appt of appointments) {
      const key = toDateKey(appt.date);
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    }
    return map;
  }, [appointments]);

  const dayAnnotations = useMemo(() => {
    const map: Record<string, { busyCount: number }> = {};
    for (const [key, appts] of Object.entries(byDate)) {
      map[key] = { busyCount: appts.length };
    }
    return map;
  }, [byDate]);

  function isDateDisabled(y: number, m: number, d: number) {
    const picked = new Date(y, m, d);
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return picked < todayMidnight;
  }

  function handlePrevMonth() {
    if (year === today.getFullYear() && month === today.getMonth()) return;
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  const daySlots = selectedDate ? byDate[selectedDate] ?? [] : [];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <CalendarGrid
        year={year}
        month={month}
        today={today}
        selectedDate={selectedDate}
        onSelectDate={(dateStr) =>
          setSelectedDate((prev) => (prev === dateStr ? null : dateStr))
        }
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        isDateDisabled={isDateDisabled}
        dayAnnotations={dayAnnotations}
      />

      <div>
        <p className="text-[clamp(14px,1vw,20px)] font-medium text-dark-charcoal mb-3 capitalize">
          {selectedDate
            ? formatDisplayDate(selectedDate)
            : "Selecciona un día para ver los horarios ocupados"}
        </p>

        {!selectedDate ? (
          <div className="h-full min-h-40 bg-cream-mid rounded-2xl border-2 border-dashed border-cream-deep flex items-center justify-center">
            <p className="text-[clamp(14px,1vw,20px)] text-charcoal-light text-center px-6">
              ← Elige un día en el calendario. Los puntos indican horarios ya
              ocupados.
            </p>
          </div>
        ) : daySlots.length === 0 ? (
          <div className="h-full min-h-40 bg-cream-mid rounded-2xl border-2 border-dashed border-cream-deep flex items-center justify-center">
            <p className="text-[clamp(14px,1vw,20px)] text-charcoal-light">Día completamente libre ✓</p>
          </div>
        ) : (
          <div className="space-y-2">
            {daySlots
              .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
              .map((slot, i) => (
                <div
                  key={i}
                  className="px-4 py-3 rounded-xl bg-cream-mid border border-cream-deep"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-serif text-[clamp(1.125rem,1.3vw,1.6rem)] text-dark-charcoal">
                      {slot.timeSlot}
                    </span>
                    <span className="shrink-0 text-[clamp(12px,0.65vw,15px)] font-medium text-muted-rose bg-muted-rose-light/30 px-2.5 py-0.5 rounded-full">
                      Ocupado
                    </span>
                  </div>
                  <p className="text-[clamp(14px,0.9vw,18px)] text-charcoal-light mt-1">
                    {slot.service.name}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Horarios de atención: cada 30 minutos, de 05:00 a 18:00.
// Compartido por el asistente de reserva público y el formulario de /admin.
export const BUSINESS_TIME_SLOTS = Array.from({ length: 27 }, (_, i) =>
  minutesToTime(5 * 60 + i * 30)
);

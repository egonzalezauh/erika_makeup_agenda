export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

// Convierte un teléfono escrito como sea ("0991234567", "099 123 4567",
// "+593 99 123 4567") en un enlace wa.me. Los celulares ecuatorianos se
// escriben localmente con un 0 inicial que hay que reemplazar por el
// código de país 593.
export function whatsappHref(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = `593${digits.slice(1)}`;
  else if (digits.length === 9) digits = `593${digits}`;
  return `https://wa.me/${digits}`;
}

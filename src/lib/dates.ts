const BUSINESS_TIMEZONE = "America/Guayaquil"; // UTC-5, no DST

const guayaquilFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIMEZONE,
});

// Resolves "today" (offsetDays = 0) or "tomorrow" (offsetDays = 1), etc.,
// as a "YYYY-MM-DD" string pinned to the business's timezone — regardless
// of what timezone the server (e.g. Vercel, running in UTC) is in.
export function guayaquilDateString(offsetDays = 0): string {
  const now = new Date(Date.now() + offsetDays * 86_400_000);
  return guayaquilFormatter.format(now);
}

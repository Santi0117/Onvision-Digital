/** Horario de reuniones — America/Costa_Rica (UTC-6, sin DST) */
export const BOOKING_TIMEZONE = "America/Costa_Rica";

export const WORKDAY_START = 8;
export const WORKDAY_END = 21;
export const SLOT_MINUTES = 30;

export function isValidBookingSlot(hour: number, minute: number): boolean {
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return false;
  if (minute !== 0 && minute !== SLOT_MINUTES) return false;
  if (hour < WORKDAY_START || hour > WORKDAY_END) return false;
  if (hour === WORKDAY_END && minute > 0) return false;
  return true;
}

/** ISO UTC para guardar en Supabase a partir de fecha local CR */
export function localCostaRicaToISO(
  dateKey: string,
  hour: number,
  minute: number,
): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utcMs = Date.UTC(y, m - 1, d, hour + 6, minute, 0);
  return new Date(utcMs).toISOString();
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

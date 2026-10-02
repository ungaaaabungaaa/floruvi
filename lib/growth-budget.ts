export const DEFAULT_RESEARCH_RESERVATION_MICROS = 1_000_000;
export const MAX_DAILY_RESEARCH_RUNS = 5;
export const APOLLO_ENRICHMENT_RESERVATION = 9;

export function budgetNumber(
  raw: string | undefined,
  fallback: number,
  maximum: number,
) {
  if (raw === undefined || !raw.trim()) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, maximum) : 0;
}
export function canReserveResearch(
  usage: { reservedMicros: number; chargedMicros: number; dailyRuns: number },
  budgetMicros: number,
  reservationMicros: number,
) {
  if (usage.dailyRuns >= MAX_DAILY_RESEARCH_RUNS)
    return "Daily research limit reached. Try tomorrow.";
  if (
    usage.reservedMicros + usage.chargedMicros + reservationMicros >
    budgetMicros
  )
    return "The monthly research budget cannot cover this run.";
  return null;
}
export function settleReservation(
  usage: { reservedMicros: number; chargedMicros: number },
  reservation: number,
  actual: number | undefined,
) {
  // Unknown provider outcomes retain the full allowance as charged, never release it for a retry.
  const charged =
    actual === undefined ? reservation : Math.max(0, Math.ceil(actual));
  return {
    reservedMicros: Math.max(0, usage.reservedMicros - reservation),
    chargedMicros: usage.chargedMicros + charged,
  };
}

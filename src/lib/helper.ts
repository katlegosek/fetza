import { Platform } from "react-native";

/** Thermal-receipt slip: Courier on iOS, generic monospace on Android. */
export const RECEIPT_MONOSPACE_FONT_FAMILY: string =
  Platform.OS === "ios" ? "Courier" : "monospace";

export function formatZAR(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`;
}

export function parseMoneyInputToCents(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function roundToTwoDecimalPlaces(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Line-total style: round Rand to 2 decimal places, then convert to cents
 * (matches manual item edit behaviour).
 */
export function parseRandStringToCents(raw: string): number | null {
  const n = Number.parseFloat(raw.trim().replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(roundToTwoDecimalPlaces(n) * 100);
}

/** Signed amounts (e.g. discounts) — allows negative values. */
export function parseSignedMoneyInputToCents(raw: string): number | null {
  const n = Number.parseFloat(raw.trim().replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(roundToTwoDecimalPlaces(n) * 100);
}

export function sumLineAmountsCents(
  lines: ReadonlyArray<{ amountCents: number }>,
): number {
  return lines.reduce((acc, l) => acc + l.amountCents, 0);
}

import type { DraftBill } from "@/mocks/review-draft.mock";
import { Platform } from "react-native";

/** Shared helpers for scan / review UI — split or rename as the domain grows. */

/** Thermal-receipt slip: Courier on iOS, generic monospace on Android. */
export const RECEIPT_MONOSPACE_FONT_FAMILY: string =
  Platform.OS === "ios" ? "Courier" : "monospace";

export function generateLineId(): string {
  return `ln-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatZAR(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`;
}

/**
 * Parse a typed amount in major units (e.g. "57.15" or "57,15") to cents.
 * Uses the same rules as fee/tax fields: non-finite or negative → null.
 */
export function parseMoneyInputToCents(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function roundToTwoDecimalPlaces(value: number): number {
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

export function sumLineAmountsCents(
  lines: ReadonlyArray<{ amountCents: number }>,
): number {
  return lines.reduce((acc, l) => acc + l.amountCents, 0);
}

export function cloneBillDraft(seed: DraftBill): DraftBill {
  return {
    ...seed,
    lines: seed.lines.map((l) => ({ ...l })),
  };
}

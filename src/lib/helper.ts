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

/** Split `totalCents` into `n` integer parts; remainder goes to the first indices (deterministic). */
export function splitCentsEqually(totalCents: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(totalCents / n);
  const rem = totalCents - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
}

export type AssignmentMap = Record<string, string[]>;

/**
 * Each member’s share of line items (split per line among assignees), plus VAT/service
 * allocated in proportion to those line shares (matches assign footer logic).
 */
export function owedCentsByMember(
  draft: DraftBill,
  assignments: AssignmentMap,
  memberIds: string[],
): Record<string, number> {
  const owed = Object.fromEntries(memberIds.map((id) => [id, 0])) as Record<
    string,
    number
  >;
  const lineSubtotal = sumLineAmountsCents(draft.lines);
  const fees = draft.vatCents + draft.serviceFeeCents;

  for (const line of draft.lines) {
    const ids = [...(assignments[line.id] ?? [])].sort();
    if (ids.length === 0) continue;
    const parts = splitCentsEqually(line.amountCents, ids.length);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      owed[id] = (owed[id] ?? 0) + (parts[i] ?? 0);
    }
  }

  if (fees > 0 && lineSubtotal > 0) {
    type Part = { id: string; base: number; frac: number };
    const parts: Part[] = [];
    let allocated = 0;
    for (const id of memberIds) {
      const exact = (fees * (owed[id] ?? 0)) / lineSubtotal;
      const base = Math.floor(exact);
      parts.push({ id, base, frac: exact - base });
      owed[id] = (owed[id] ?? 0) + base;
      allocated += base;
    }
    let rem = fees - allocated;
    parts.sort((a, b) => b.frac - a.frac);
    let k = 0;
    while (rem > 0 && parts.length > 0) {
      owed[parts[k % parts.length].id] += 1;
      rem -= 1;
      k += 1;
    }
  } else if (fees > 0 && memberIds.length > 0) {
    const parts = splitCentsEqually(fees, memberIds.length);
    for (let i = 0; i < memberIds.length; i++) {
      const id = memberIds[i];
      owed[id] = (owed[id] ?? 0) + (parts[i] ?? 0);
    }
  }

  return owed;
}

export type MemberLineShare = {
  lineId: string;
  description: string;
  assigneeCount: number;
  lineTotalCents: number;
  shareCents: number;
};

/** Receipt lines assigned to `memberId`, with equal split share per line (pre-fee). */
export function memberLineShares(
  draft: DraftBill,
  assignments: AssignmentMap,
  memberId: string,
): MemberLineShare[] {
  const result: MemberLineShare[] = [];
  for (const line of draft.lines) {
    const ids = [...(assignments[line.id] ?? [])].sort();
    if (!ids.includes(memberId)) continue;
    const n = ids.length;
    const parts = splitCentsEqually(line.amountCents, n);
    const idx = ids.indexOf(memberId);
    result.push({
      lineId: line.id,
      description: line.description,
      assigneeCount: n,
      lineTotalCents: line.amountCents,
      shareCents: parts[idx] ?? 0,
    });
  }
  return result;
}

/** How many receipt lines include `memberId` in their assignment set. */
export function assignedLineCountForMember(
  draft: DraftBill,
  assignments: AssignmentMap,
  memberId: string,
): number {
  let n = 0;
  for (const line of draft.lines) {
    const ids = assignments[line.id] ?? [];
    if (ids.includes(memberId)) n++;
  }
  return n;
}

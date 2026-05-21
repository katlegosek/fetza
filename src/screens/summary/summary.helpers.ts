import { sumLineAmountsCents } from "@/lib/helper";
import { cloneBillDraft } from "@/mocks/draft-bill.helpers";
import type { DraftBill } from "@/mocks/review-draft.mock";
import type {
  SummaryMember,
  SummaryPayload,
} from "@/screens/summary/summary.constants";
import { asSingleRouteParam } from "@/utils/route-params";

export type AssignmentMap = Record<string, string[]>;

/** Split `totalCents` into `n` integer parts; remainder goes to the first indices (deterministic). */
function splitCentsEqually(totalCents: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(totalCents / n);
  const rem = totalCents - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
}

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
    const feeParts = splitCentsEqually(fees, memberIds.length);
    for (let i = 0; i < memberIds.length; i++) {
      const id = memberIds[i];
      owed[id] = (owed[id] ?? 0) + (feeParts[i] ?? 0);
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

/** @deprecated Prefer `asSingleRouteParam` from `@/utils/route-params` in route files. */
export const asSingleParam = asSingleRouteParam;

export function isYouMember(m: SummaryMember): boolean {
  return m.id === "m-you" || m.name.trim().toLowerCase() === "you";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function parseSummaryPayload(
  raw: string | undefined,
): SummaryPayload | null {
  if (!raw || raw.length === 0) return null;
  try {
    const p = JSON.parse(raw) as SummaryPayload;
    if (
      !p?.draft?.lines ||
      p.assignments == null ||
      !Array.isArray(p.members)
    ) {
      return null;
    }
    return {
      draft: cloneBillDraft(p.draft),
      assignments: { ...p.assignments },
      members: p.members.map((m) => ({ ...m })),
    };
  } catch {
    return null;
  }
}

export function sortMembersYouFirst(members: SummaryMember[]): SummaryMember[] {
  return [...members].sort((a, b) => {
    const aY = isYouMember(a);
    const bY = isYouMember(b);
    if (aY && !bY) return -1;
    if (!aY && bY) return 1;
    return 0;
  });
}

export type SummaryModel = {
  draft: DraftBill;
  assignments: AssignmentMap;
  members: SummaryMember[];
  owed: Record<string, number>;
  grandTotalCents: number;
  tipCents: number;
  tipPercentLabel: string;
};

export function buildSummaryModel(payload: SummaryPayload): SummaryModel {
  const { draft, assignments, members } = payload;
  const memberIds = members.map((m) => m.id);
  const owed = owedCentsByMember(draft, assignments, memberIds);
  const linesSub = sumLineAmountsCents(draft.lines);
  const grandTotalCents = linesSub + draft.vatCents + draft.serviceFeeCents;
  const tipCents = draft.serviceFeeCents;
  const tipPercentLabel =
    linesSub > 0 && tipCents > 0
      ? `${Math.round((tipCents / linesSub) * 100)}% of bill`
      : tipCents > 0
        ? "Service charge"
        : "No tip";

  return {
    draft,
    assignments,
    members,
    owed,
    grandTotalCents,
    tipCents,
    tipPercentLabel,
  };
}

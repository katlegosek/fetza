import {
  type AssignmentMap,
  cloneBillDraft,
  owedCentsByMember,
  sumLineAmountsCents,
} from "@/lib/helper";
import type { DraftBill } from "@/mocks/review-draft.mock";

import type {
  SummaryMember,
  SummaryPayload,
} from "@/screens/summary/summary.constants";

export function asSingleParam(
  v: string | string[] | undefined,
): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

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

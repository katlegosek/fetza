import type { DraftBill } from "@/types/draft-bill";

import type { MockAssignMember } from "@/reference/mock-flow/assign-mock.constants";

export type MockAssignments = Record<string, string[]>;

export function cloneAssignments(
  assignments: MockAssignments,
): MockAssignments {
  const next: MockAssignments = {};
  for (const key of Object.keys(assignments)) {
    next[key] = [...assignments[key]];
  }
  return next;
}

export function isBillSplitEquallyAmongAll(
  lines: DraftBill["lines"],
  members: MockAssignMember[],
  assignments: MockAssignments,
): boolean {
  if (members.length === 0 || lines.length === 0) return false;
  const expected = new Set(members.map((member) => member.id));
  for (const line of lines) {
    const got = new Set(assignments[line.id] ?? []);
    if (got.size !== expected.size) return false;
    for (const id of expected) {
      if (!got.has(id)) return false;
    }
  }
  return true;
}

export function isDraftParamReady(draftParam: string | undefined): boolean {
  return typeof draftParam === "string" && draftParam.length > 0;
}

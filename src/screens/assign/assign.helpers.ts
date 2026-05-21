import type { DraftBill } from "@/mocks/review-draft.mock";

import type {
  AssignMember,
  Assignments,
} from "@/screens/assign/assign.constants";

export function cloneAssignments(assignments: Assignments): Assignments {
  const next: Assignments = {};
  for (const key of Object.keys(assignments)) {
    next[key] = [...assignments[key]];
  }
  return next;
}

/** Every line includes exactly the current member set (full split-everything state). */
export function isBillSplitEquallyAmongAll(
  lines: DraftBill["lines"],
  members: AssignMember[],
  assignments: Assignments,
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

export function assignOverflowMenuTop(safeAreaTop: number): number {
  return safeAreaTop + 84;
}

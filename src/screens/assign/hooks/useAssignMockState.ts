import { useEffect, useRef, useState } from "react";

import { cloneBillDraft } from "@/mocks/draft-bill.helpers";
import type { DraftBill } from "@/mocks/review-draft.mock";
import {
  type AssignMember,
  type Assignments,
  SEED_MEMBERS,
} from "@/screens/assign/assign.constants";
import { cloneAssignments } from "@/screens/assign/assign.helpers";

export function useAssignMockState(draftParam: string | undefined) {
  const [draft, setDraft] = useState<DraftBill | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [members, setMembers] = useState<AssignMember[]>(SEED_MEMBERS);
  const [assignments, setAssignments] = useState<Assignments>({});
  const assignmentsBeforeSplitRef = useRef<Assignments | null>(null);

  useEffect(() => {
    if (!draftParam) {
      setDraft(null);
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(draftParam) as DraftBill;
      setDraft(cloneBillDraft(parsed));
      setAssignments({});
      assignmentsBeforeSplitRef.current = null;
      setMembers(SEED_MEMBERS);
    } catch {
      setDraft(null);
    } finally {
      setHydrated(true);
    }
  }, [draftParam]);

  const resetAssignmentsBeforeSplit = () => {
    assignmentsBeforeSplitRef.current = null;
  };

  const snapshotAssignmentsBeforeSplit = (current: Assignments) => {
    assignmentsBeforeSplitRef.current = cloneAssignments(current);
  };

  const restoreAssignmentsBeforeSplit = () => {
    const snapshot = assignmentsBeforeSplitRef.current;
    if (snapshot === null) {
      return;
    }
    setAssignments(cloneAssignments(snapshot));
    assignmentsBeforeSplitRef.current = null;
  };

  return {
    draft,
    setDraft,
    hydrated,
    members,
    setMembers,
    assignments,
    setAssignments,
    assignmentsBeforeSplitRef,
    resetAssignmentsBeforeSplit,
    snapshotAssignmentsBeforeSplit,
    restoreAssignmentsBeforeSplit,
  };
}

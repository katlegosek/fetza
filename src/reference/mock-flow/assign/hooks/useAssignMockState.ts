import { useEffect, useRef, useState } from "react";

import {
  type MockAssignMember,
  SEED_MEMBERS,
} from "@/reference/mock-flow/assign-mock.constants";
import {
  type MockAssignments,
  cloneAssignments,
} from "@/reference/mock-flow/assign-mock.helpers";
import { cloneBillDraft } from "@/reference/mock-flow/draft-bill.helpers";
import type { DraftBill } from "@/types/draft-bill";

export function useAssignMockState(draftParam: string | undefined) {
  const [draft, setDraft] = useState<DraftBill | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [members, setMembers] = useState<MockAssignMember[]>(SEED_MEMBERS);
  const [assignments, setAssignments] = useState<MockAssignments>({});
  const assignmentsBeforeSplitRef = useRef<MockAssignments | null>(null);

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

  const snapshotAssignmentsBeforeSplit = (current: MockAssignments) => {
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

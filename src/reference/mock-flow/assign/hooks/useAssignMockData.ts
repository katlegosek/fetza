import { useMemo } from "react";

import { sumLineAmountsCents } from "@/lib/helper";
import type { MockAssignments } from "@/reference/mock-flow/assign-mock.helpers";
import type { Assignments } from "@/screens/assign/assign.constants";
import type { AssignLine } from "@/screens/assign/mappers/bill-to-assign";
import type { BillSummary } from "@/services/bills/types";
import type { DraftBill, ReceiptLine } from "@/types/draft-bill";

export type UseAssignMockDataOptions = {
  isApiMode: boolean;
  lines: Array<AssignLine | ReceiptLine>;
  displayAssignments: Assignments;
  draft: DraftBill | null;
  mockAssignments: MockAssignments;
  summaryData?: BillSummary;
  draftLines: ReceiptLine[];
  apiLines: AssignLine[];
};

export function useAssignMockData({
  isApiMode,
  lines,
  displayAssignments,
  draft,
  mockAssignments,
  summaryData,
  draftLines,
  apiLines,
}: UseAssignMockDataOptions) {
  const linesSubtotalCents = useMemo(
    () => sumLineAmountsCents(isApiMode ? apiLines : draftLines),
    [apiLines, draftLines, isApiMode],
  );

  const assignedItemsTotalCents = useMemo(() => {
    if (isApiMode) {
      return summaryData?.totals.assigned_total_cents ?? 0;
    }
    if (!draft) return 0;

    let assignedSubtotal = 0;
    for (const line of draft.lines) {
      if ((mockAssignments[line.id]?.length ?? 0) > 0) {
        assignedSubtotal += line.amountCents;
      }
    }
    if (assignedSubtotal === 0) return 0;
    if (linesSubtotalCents <= 0) return assignedSubtotal;

    const ratio = assignedSubtotal / linesSubtotalCents;
    const feesCents = draft.vatCents + draft.serviceFeeCents;
    return Math.round(assignedSubtotal + feesCents * ratio);
  }, [
    draft,
    isApiMode,
    linesSubtotalCents,
    mockAssignments,
    summaryData?.totals.assigned_total_cents,
  ]);

  const assignedLineCount = useMemo(() => {
    if (isApiMode) {
      return lines.filter(
        (line) => (displayAssignments[line.id]?.length ?? 0) > 0,
      ).length;
    }
    if (!draft) return 0;
    return draft.lines.filter(
      (line) => (mockAssignments[line.id]?.length ?? 0) > 0,
    ).length;
  }, [displayAssignments, draft, isApiMode, lines, mockAssignments]);

  const assignmentLineTotal = isApiMode
    ? (summaryData?.bill.items_count ?? lines.length)
    : (draft?.lines.length ?? 0);

  const allLinesAssigned = useMemo(() => {
    if (assignmentLineTotal === 0) return false;
    if (isApiMode) {
      return lines.length > 0 && assignedLineCount === lines.length;
    }
    if (!draft) return false;
    return draft.lines.every(
      (line) => (mockAssignments[line.id]?.length ?? 0) > 0,
    );
  }, [
    assignedLineCount,
    assignmentLineTotal,
    draft,
    isApiMode,
    lines.length,
    mockAssignments,
  ]);

  return {
    assignedItemsTotalCents,
    assignedLineCount,
    assignmentLineTotal,
    allLinesAssigned,
    linesSubtotalCents,
  };
}

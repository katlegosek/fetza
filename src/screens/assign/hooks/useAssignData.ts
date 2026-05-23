import { useMemo } from "react";

import type { Assignments } from "@/screens/assign/assign.constants";
import type { AssignLine } from "@/screens/assign/mappers/bill-to-assign";
import type { BillSummary } from "@/services/bills/types";

export type UseAssignDataOptions = {
  lines: AssignLine[];
  displayAssignments: Assignments;
  summaryData?: BillSummary;
};

export const useAssignData = ({
  lines,
  displayAssignments,
  summaryData,
}: UseAssignDataOptions) => {
  const assignedItemsTotalCents = summaryData?.totals.assigned_total_cents ?? 0;

  const assignedLineCount = useMemo(() => {
    return lines.filter(
      (line) => (displayAssignments[line.id]?.length ?? 0) > 0,
    ).length;
  }, [displayAssignments, lines]);

  const assignmentLineTotal = summaryData?.bill.items_count ?? lines.length;

  const allLinesAssigned = useMemo(() => {
    if (assignmentLineTotal === 0) return false;
    return lines.length > 0 && assignedLineCount === lines.length;
  }, [assignedLineCount, assignmentLineTotal, lines.length]);

  return {
    assignedItemsTotalCents,
    assignedLineCount,
    assignmentLineTotal,
    allLinesAssigned,
  };
};

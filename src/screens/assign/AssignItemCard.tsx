import type { AssignMember } from "@/screens/assign/assign.constants";
import { AssignLineRow } from "@/screens/assign/components";
import type { AssignLine } from "@/screens/assign/mappers/bill-to-assign";
import type { ReceiptLine } from "@/types/draft-bill";

export type AssignItemCardProps = {
  line: AssignLine | ReceiptLine;
  assigned: AssignMember[];
  index: number;
  activeMemberId: string | null;
  formatAmount?: (cents: number) => string;
  onPress: () => void;
  showDivider?: boolean;
};

export const AssignItemCard = ({
  line,
  assigned,
  index,
  activeMemberId,
  formatAmount,
  onPress,
  showDivider = false,
}: AssignItemCardProps) => {
  return (
    <AssignLineRow
      assigned={assigned}
      formatAmount={formatAmount}
      index={index}
      line={line}
      lineHint={
        activeMemberId
          ? "Adds or removes the selected person on this line."
          : "Opens who shared this item."
      }
      showDivider={showDivider}
      unassignedLabel="Tap to assign"
      variant="assign"
      onPress={onPress}
    />
  );
};

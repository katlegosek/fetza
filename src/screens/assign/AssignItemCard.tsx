import { View } from "react-native";

import { AssignLineRow } from "@/components";
import { cn } from "@/lib/cn";
import type { AssignMember } from "@/screens/assign/assign.constants";
import type { AssignLine } from "@/screens/assign/mappers/bill-to-assign";
import type { ReceiptLine } from "@/types/draft-bill";

export type AssignItemCardProps = {
  line: AssignLine | ReceiptLine;
  assigned: AssignMember[];
  index: number;
  activeMemberId: string | null;
  formatAmount?: (cents: number) => string;
  onPress: () => void;
};

export const AssignItemCard = ({
  line,
  assigned,
  index,
  activeMemberId,
  formatAmount,
  onPress,
}: AssignItemCardProps) => {
  return (
    <View
      className={cn(
        "overflow-hidden rounded-2xl border border-stone-200/30 bg-white shadow-sm shadow-stone-900/5 dark:border-neutral-800/45 dark:bg-neutral-900 dark:shadow-none",
        index > 0 && "-mt-px",
      )}
    >
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
        unassignedLabel="Tap to assign"
        variant="assign"
        onPress={onPress}
      />
    </View>
  );
};

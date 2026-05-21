import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { AppText, Button } from "@/components";

export type BillDetailActionsProps = {
  onViewReceipt: () => void;
  onAssignItems: () => void;
};

export const BillDetailActions = ({
  onViewReceipt,
  onAssignItems,
}: BillDetailActionsProps) => {
  return (
    <View className="mt-4 flex-row gap-3">
      <Button
        accessibilityLabel="View receipt"
        className="min-w-0 flex-1 flex-row items-center justify-center gap-2 border border-violet-200/70 bg-white dark:border-violet-900/45 dark:bg-neutral-900"
        onPress={onViewReceipt}
      >
        <Ionicons name="receipt-outline" size={18} color="#7c3aed" />
        <AppText className="text-base font-semibold text-foreground">
          Receipt
        </AppText>
      </Button>
      <Button
        accessibilityLabel="Assign items"
        className="min-w-0 flex-1 flex-row items-center justify-center gap-2 border border-violet-200/70 bg-white dark:border-violet-900/45 dark:bg-neutral-900"
        onPress={onAssignItems}
      >
        <Ionicons name="people-outline" size={18} color="#7c3aed" />
        <AppText className="text-base font-semibold text-foreground">
          Assign
        </AppText>
      </Button>
    </View>
  );
};

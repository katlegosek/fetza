import { View } from "react-native";

import { NativeGlassButton } from "@/components";

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
      <NativeGlassButton
        accessibilityLabel="View receipt"
        className="min-w-0 flex-1"
        label="Receipt"
        systemImage="receipt"
        variant="glass"
        onPress={onViewReceipt}
      />
      <NativeGlassButton
        accessibilityLabel="Assign items"
        className="min-w-0 flex-1"
        label="Assign"
        systemImage="person.2"
        variant="glass"
        onPress={onAssignItems}
      />
    </View>
  );
};

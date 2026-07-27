import { View } from "react-native";

import { NativeGlassButton } from "@/components";

export const BillRoomActions = ({
  isFinalizing,
  roomOpen,
  onManualAssign,
  onFinalize,
  onViewSummary,
}: {
  isFinalizing: boolean;
  roomOpen: boolean;
  onManualAssign: () => void;
  onFinalize: () => void;
  onViewSummary: () => void;
}) => {
  return (
    <View className="gap-3">
      {roomOpen ? (
        <>
          <NativeGlassButton
            accessibilityLabel="Assign items manually"
            label="Assign items manually"
            systemImage="person.2"
            variant="glass"
            onPress={onManualAssign}
          />
          <NativeGlassButton
            accessibilityLabel="Finalise bill"
            disabled={isFinalizing}
            label={isFinalizing ? "Finalising…" : "Finalise bill"}
            systemImage="checkmark"
            variant="glassProminent"
            onPress={onFinalize}
          />
        </>
      ) : (
        <NativeGlassButton
          accessibilityLabel="View summary"
          label="View summary"
          systemImage="list.bullet.rectangle"
          variant="glassProminent"
          onPress={onViewSummary}
        />
      )}
    </View>
  );
};

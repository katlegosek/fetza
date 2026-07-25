import { ActivityIndicator, View } from "react-native";

import { AppText, Button } from "@/components";
import { useThemeColors } from "@/hooks";

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
  const colors = useThemeColors();

  return (
    <View className="gap-3">
      {roomOpen ? (
        <>
          <Button
            className="border border-borderSubtle bg-background"
            onPress={onManualAssign}
          >
            <AppText className="font-semibold text-foreground">
              Assign items manually
            </AppText>
          </Button>
          <Button disabled={isFinalizing} onPress={onFinalize}>
            {isFinalizing ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <AppText className="font-semibold text-background">
                Finalise bill
              </AppText>
            )}
          </Button>
        </>
      ) : (
        <Button onPress={onViewSummary}>
          <AppText className="font-semibold text-background">
            View summary
          </AppText>
        </Button>
      )}
    </View>
  );
};

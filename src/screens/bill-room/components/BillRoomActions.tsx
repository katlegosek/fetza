import { ActivityIndicator, View } from "react-native";

import { AppText, Button } from "@/components";
import { useThemeColors } from "@/hooks";

export const BillRoomActions = ({
  isFinalizing,
  onManualAssign,
  onFinalize,
}: {
  isFinalizing: boolean;
  onManualAssign: () => void;
  onFinalize: () => void;
}) => {
  const colors = useThemeColors();

  return (
    <View className="gap-3">
      <Button
        className="border border-borderSubtle bg-background"
        onPress={onManualAssign}
      >
        <AppText className="font-semibold text-foreground">
          Add people or assign manually
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
    </View>
  );
};

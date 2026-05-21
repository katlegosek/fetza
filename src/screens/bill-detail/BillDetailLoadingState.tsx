import { ActivityIndicator, View } from "react-native";

import { AppText, ScreenContainer, ScreenHeader } from "@/components";

export type BillDetailLoadingStateProps = {
  title?: string;
  onBack: () => void;
};

export const BillDetailLoadingState = ({
  title = "Summary",
  onBack,
}: BillDetailLoadingStateProps) => {
  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader title={title} onBack={onBack} />
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator accessibilityLabel="Loading bill summary" />
        <AppText className="text-sm text-muted">Loading bill summary…</AppText>
      </View>
    </ScreenContainer>
  );
};

import { ActivityIndicator, View } from "react-native";

import { AppText, ScreenContainer, ScreenHeader } from "@/components";

export type AssignLoadingStateProps = {
  onBack: () => void;
};

export const AssignLoadingState = ({ onBack }: AssignLoadingStateProps) => {
  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader title="Assign Items" onBack={onBack} />
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator accessibilityLabel="Loading bill assignments" />
        <AppText className="text-sm text-muted">Loading bill…</AppText>
      </View>
    </ScreenContainer>
  );
};

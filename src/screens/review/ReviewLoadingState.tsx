import { ActivityIndicator, View } from "react-native";

import { AppText, ScreenContainer, ScreenHeader } from "@/components";

export type ReviewLoadingStateProps = {
  title: string;
  onBack: () => void;
};

export const ReviewLoadingState = ({
  title,
  onBack,
}: ReviewLoadingStateProps) => {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader title={title} onBack={onBack} />
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator accessibilityLabel="Loading receipt" />
        <AppText className="text-sm text-muted">Loading receipt…</AppText>
      </View>
    </ScreenContainer>
  );
};

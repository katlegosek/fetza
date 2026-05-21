import { Pressable, View } from "react-native";

import { AppText, ScreenContainer, ScreenHeader } from "@/components";

export type ReviewErrorStateProps = {
  title: string;
  message: string;
  onBack: () => void;
  onRetry: () => void;
};

export const ReviewErrorState = ({
  title,
  message,
  onBack,
  onRetry,
}: ReviewErrorStateProps) => {
  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader title={title} onBack={onBack} />
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <AppText className="text-center text-sm text-foreground">
          {message}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry loading receipt"
          className="rounded-xl border border-borderSubtle px-4 py-2 active:opacity-70"
          onPress={onRetry}
        >
          <AppText className="text-sm font-medium text-foreground">
            Try again
          </AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

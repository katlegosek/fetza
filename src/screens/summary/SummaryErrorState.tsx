import { Pressable, View } from "react-native";

import { AppText, ScreenContainer, ScreenHeader } from "@/components";

export type SummaryErrorStateProps = {
  title?: string;
  message: string;
  onBack: () => void;
  onRetry?: () => void;
};

export const SummaryErrorState = ({
  title = "Summary",
  message,
  onBack,
  onRetry,
}: SummaryErrorStateProps) => {
  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader title={title} onBack={onBack} />
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <AppText className="text-center text-sm text-foreground">
          {message}
        </AppText>
        {onRetry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading bill summary"
            className="rounded-xl border border-borderSubtle px-4 py-2 active:opacity-70"
            onPress={onRetry}
          >
            <AppText className="text-sm font-medium text-foreground">
              Try again
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

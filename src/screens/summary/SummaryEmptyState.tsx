import { View } from "react-native";

import { AppText, Button, ScreenContainer, ScreenHeader } from "@/components";

export type SummaryEmptyStateProps = {
  onBack: () => void;
};

export const SummaryEmptyState = ({ onBack }: SummaryEmptyStateProps) => {
  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader title="Summary" onBack={onBack} />
      <View className="flex-1 bg-stone-50 dark:bg-neutral-950/50">
        <View className="flex-1 items-center justify-center px-6">
          <AppText className="text-center text-base leading-6 text-muted">
            No bill data to show. Open Summary from Assign after splitting
            items.
          </AppText>
          <Button className="mt-6 w-full" onPress={onBack}>
            Go back
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
};

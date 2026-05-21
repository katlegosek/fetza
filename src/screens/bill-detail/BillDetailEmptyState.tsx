import { View } from "react-native";

import { AppText, Button, ScreenContainer, ScreenHeader } from "@/components";
import type { BillDetailEmptyStateVariant } from "@/screens/bill-detail/bill-detail.types";

export type BillDetailEmptyStateProps = {
  variant: BillDetailEmptyStateVariant;
  title?: string;
  onBack: () => void;
};

const MESSAGES: Record<BillDetailEmptyStateVariant, string> = {
  "invalid-bill": "This bill link is invalid.",
  "no-data": "No summary data for this bill.",
};

export const BillDetailEmptyState = ({
  variant,
  title = "Summary",
  onBack,
}: BillDetailEmptyStateProps) => {
  const message = MESSAGES[variant];

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader title={title} onBack={onBack} />
      <View className="flex-1 items-center justify-center px-6">
        <AppText className="text-center text-sm text-muted">{message}</AppText>
        <Button className="mt-6 w-full" onPress={onBack}>
          Go back
        </Button>
      </View>
    </ScreenContainer>
  );
};

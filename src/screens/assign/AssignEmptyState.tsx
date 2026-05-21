import { View } from "react-native";

import { AppText, Button, ScreenContainer, ScreenHeader } from "@/components";

export type AssignEmptyStateVariant =
  | "invalid-bill"
  | "no-assignment-data"
  | "no-draft-param"
  | "draft-loading"
  | "draft-load-failed"
  | "no-lines"
  | "no-participants";

export type AssignEmptyStateProps = {
  variant: AssignEmptyStateVariant;
  merchantTopHint?: string;
  billId?: number;
  onBack: () => void;
  onReviewReceipt?: () => void;
};

const MESSAGES: Record<AssignEmptyStateVariant, string> = {
  "invalid-bill": "This bill link is invalid.",
  "no-assignment-data": "No assignment data for this bill.",
  "no-draft-param": "Nothing to assign. Go back and review a receipt first.",
  "draft-loading": "Loading…",
  "draft-load-failed":
    "This receipt could not be loaded. Go back and try Continue again.",
  "no-lines": "No receipt items to assign on this bill yet.",
  "no-participants": "No participants on this bill yet.",
};

export const AssignEmptyState = ({
  variant,
  merchantTopHint,
  onBack,
  onReviewReceipt,
}: AssignEmptyStateProps) => {
  const message = MESSAGES[variant];
  const showHeader = variant === "no-lines" || variant === "no-participants";
  const isDraftLoading = variant === "draft-loading";

  if (isDraftLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <AppText className="text-muted-foreground">{message}</AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      className={showHeader ? "flex-1" : "items-center justify-center px-6"}
    >
      {showHeader ? (
        <ScreenHeader
          title="Assign Items"
          topHint={merchantTopHint}
          onBack={onBack}
        />
      ) : null}
      <View
        className={
          showHeader
            ? "flex-1 items-center justify-center px-6"
            : "items-center"
        }
      >
        <AppText
          className={
            showHeader
              ? "text-center text-sm text-muted"
              : "text-center text-base text-muted-foreground"
          }
        >
          {message}
        </AppText>
        {variant === "no-lines" && onReviewReceipt ? (
          <Button className="mt-6 w-full" onPress={onReviewReceipt}>
            Review receipt
          </Button>
        ) : (
          <Button className="mt-6 w-full" onPress={onBack}>
            {variant === "invalid-bill" ||
            variant === "no-assignment-data" ||
            variant === "no-draft-param" ||
            variant === "draft-load-failed"
              ? "Go Back"
              : "Go back"}
          </Button>
        )}
      </View>
    </ScreenContainer>
  );
};

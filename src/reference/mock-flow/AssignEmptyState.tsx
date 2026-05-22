import { AppText, ScreenContainer, ScreenEmptyState } from "@/components";

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

const CENTERED_VARIANTS: AssignEmptyStateVariant[] = [
  "invalid-bill",
  "no-assignment-data",
  "no-draft-param",
  "draft-load-failed",
];

export const AssignEmptyState = ({
  variant,
  merchantTopHint,
  onBack,
  onReviewReceipt,
}: AssignEmptyStateProps) => {
  const message = MESSAGES[variant];

  if (variant === "draft-loading") {
    return (
      <ScreenContainer className="items-center justify-center">
        <AppText className="text-muted-foreground">{message}</AppText>
      </ScreenContainer>
    );
  }

  const showHeader = variant === "no-lines" || variant === "no-participants";
  const centered = CENTERED_VARIANTS.includes(variant);

  if (centered) {
    return (
      <ScreenEmptyState
        message={message}
        showHeader={false}
        containerClassName="items-center justify-center px-6"
        messageClassName="text-center text-base text-muted-foreground"
        actionLabel="Go Back"
        onAction={onBack}
      />
    );
  }

  return (
    <ScreenEmptyState
      title="Assign Items"
      topHint={showHeader ? merchantTopHint : undefined}
      message={message}
      showHeader={showHeader}
      onBack={onBack}
      actionLabel={
        variant === "no-lines" && onReviewReceipt ? "Review receipt" : "Go back"
      }
      onAction={
        variant === "no-lines" && onReviewReceipt ? onReviewReceipt : onBack
      }
    />
  );
};

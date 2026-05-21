import { ScreenEmptyState } from "@/components/feedback";
import {
  CENTERED_EMPTY_CONTAINER_CLASS,
  CENTERED_EMPTY_MESSAGE_CLASS,
  FEEDBACK_MESSAGES,
  SCREEN_TITLES,
} from "@/components/feedback/screen-feedback-copy";

export type AssignEmptyStateVariant =
  | "invalid-bill"
  | "no-assignment-data"
  | "no-lines"
  | "no-participants";

export type AssignEmptyStateProps = {
  variant: AssignEmptyStateVariant;
  merchantTopHint?: string;
  onBack: () => void;
  onReviewReceipt?: () => void;
};

const MESSAGES: Record<AssignEmptyStateVariant, string> = {
  "invalid-bill": FEEDBACK_MESSAGES.invalidBillLink,
  "no-assignment-data": FEEDBACK_MESSAGES.assignNoAssignmentData,
  "no-lines": FEEDBACK_MESSAGES.assignNoLines,
  "no-participants": FEEDBACK_MESSAGES.assignNoParticipants,
};

export const AssignEmptyState = ({
  variant,
  merchantTopHint,
  onBack,
  onReviewReceipt,
}: AssignEmptyStateProps) => {
  const message = MESSAGES[variant];
  const showHeader = variant === "no-lines" || variant === "no-participants";

  if (variant === "invalid-bill" || variant === "no-assignment-data") {
    return (
      <ScreenEmptyState
        message={message}
        showHeader={false}
        containerClassName={CENTERED_EMPTY_CONTAINER_CLASS}
        messageClassName={CENTERED_EMPTY_MESSAGE_CLASS}
        actionLabel="Go back"
        onAction={onBack}
      />
    );
  }

  return (
    <ScreenEmptyState
      title={SCREEN_TITLES.assign}
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

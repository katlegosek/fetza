import { ScreenEmptyState } from "@/components/molecules";
import {
  CENTERED_EMPTY_CONTAINER_CLASS,
  CENTERED_EMPTY_MESSAGE_CLASS,
  FEEDBACK_MESSAGES,
  SCREEN_TITLES,
} from "@/lib/screen-feedback-copy";

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
  onAddPerson?: () => void;
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
  onAddPerson,
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

  const { actionLabel, onAction } = resolveEmptyStateAction({
    variant,
    onBack,
    onReviewReceipt,
    onAddPerson,
  });

  return (
    <ScreenEmptyState
      title={SCREEN_TITLES.assign}
      topHint={showHeader ? merchantTopHint : undefined}
      message={message}
      showHeader={showHeader}
      onBack={onBack}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
};

function resolveEmptyStateAction({
  variant,
  onBack,
  onReviewReceipt,
  onAddPerson,
}: {
  variant: AssignEmptyStateVariant;
  onBack: () => void;
  onReviewReceipt?: () => void;
  onAddPerson?: () => void;
}): { actionLabel: string; onAction: () => void } {
  if (variant === "no-lines" && onReviewReceipt) {
    return { actionLabel: "Review receipt", onAction: onReviewReceipt };
  }

  // With no participants the header back arrow covers "go back", so the primary
  // action adds the first person without leaving the assign step.
  if (variant === "no-participants" && onAddPerson) {
    return { actionLabel: "Add person", onAction: onAddPerson };
  }

  return { actionLabel: "Go back", onAction: onBack };
}

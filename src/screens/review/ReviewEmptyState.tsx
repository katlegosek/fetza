import { ScreenEmptyState } from "@/components/feedback";
import {
  FEEDBACK_MESSAGES,
  REVIEW_FEEDBACK_CONTAINER_CLASS,
} from "@/components/feedback/screen-feedback-copy";

export type ReviewEmptyStateProps = {
  title: string;
  onBack: () => void;
};

export const ReviewEmptyState = ({ title, onBack }: ReviewEmptyStateProps) => {
  return (
    <ScreenEmptyState
      title={title}
      message={FEEDBACK_MESSAGES.reviewNoReceipt}
      containerClassName={REVIEW_FEEDBACK_CONTAINER_CLASS}
      onBack={onBack}
      onAction={onBack}
    />
  );
};

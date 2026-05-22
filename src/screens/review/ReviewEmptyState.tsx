import { ScreenEmptyState } from "@/components/molecules";
import {
  FEEDBACK_MESSAGES,
  REVIEW_FEEDBACK_CONTAINER_CLASS,
} from "@/lib/screen-feedback-copy";

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

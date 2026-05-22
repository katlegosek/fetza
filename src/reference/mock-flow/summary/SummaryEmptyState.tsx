import { ScreenEmptyState } from "@/components/molecules";

export type SummaryEmptyStateProps = {
  onBack: () => void;
};

export const SummaryEmptyState = ({ onBack }: SummaryEmptyStateProps) => {
  return (
    <ScreenEmptyState
      title="Summary"
      message="No bill data to show. Open Summary from Assign after splitting items."
      messageClassName="text-base leading-6"
      containerClassName="flex-1"
      bodyClassName="flex-1 bg-stone-50 dark:bg-neutral-950/50"
      onBack={onBack}
      onAction={onBack}
    />
  );
};

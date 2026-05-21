import { ScreenEmptyState } from "@/components/feedback";
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
  return (
    <ScreenEmptyState
      title={title}
      message={MESSAGES[variant]}
      onBack={onBack}
      onAction={onBack}
    />
  );
};

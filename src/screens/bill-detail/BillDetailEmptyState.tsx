import { ScreenEmptyState } from "@/components/molecules";
import { FEEDBACK_MESSAGES, SCREEN_TITLES } from "@/lib/screen-feedback-copy";
import type { BillDetailEmptyStateVariant } from "@/screens/bill-detail/bill-detail.types";

export type BillDetailEmptyStateProps = {
  variant: BillDetailEmptyStateVariant;
  title?: string;
  onBack: () => void;
};

const MESSAGES: Record<BillDetailEmptyStateVariant, string> = {
  "invalid-bill": FEEDBACK_MESSAGES.invalidBillLink,
  "no-data": FEEDBACK_MESSAGES.billDetailNoData,
};

export const BillDetailEmptyState = ({
  variant,
  title = SCREEN_TITLES.billDetail,
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

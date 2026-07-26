import { View } from "react-native";

import { AppText, ChatListRow } from "@/components";
import type { BillSummaryAdjustment } from "@/services/bills/types";
import { formatMoneyFromCents } from "@/utils/money";

export type BillDetailAdjustmentsSectionProps = {
  adjustments: BillSummaryAdjustment[];
};

export const BillDetailAdjustmentsSection = ({
  adjustments,
}: BillDetailAdjustmentsSectionProps) => {
  if (adjustments.length === 0) {
    return null;
  }

  return (
    <>
      <AppText className="mt-6 text-base font-semibold text-foreground">
        Receipt adjustments
      </AppText>
      <View className="-mx-4 mt-1">
        {adjustments.map((adjustment, index) => (
          <ChatListRow
            key={adjustment.id}
            leading={
              <View className="size-12 items-center justify-center rounded-full bg-stone-200/70 dark:bg-neutral-800">
                <AppText className="text-[13px] font-semibold text-muted">
                  ±
                </AppText>
              </View>
            }
            preview={`${adjustment.kind.replaceAll("_", " ")}${
              adjustment.affects_total ? "" : " · not in total"
            }`}
            showDivider={index < adjustments.length - 1}
            size="md"
            title={adjustment.label}
            trailingBottom={formatMoneyFromCents(adjustment.amount_cents)}
          />
        ))}
      </View>
    </>
  );
};

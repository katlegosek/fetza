import { View } from "react-native";

import { AppText } from "@/components";
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
      <View className="mt-3 overflow-hidden rounded-2xl border border-stone-200/30 bg-background dark:border-neutral-800/45">
        {adjustments.map((adjustment, index) => (
          <View key={adjustment.id}>
            {index > 0 ? (
              <View className="mx-4 h-px bg-stone-200/30 dark:bg-neutral-700/35" />
            ) : null}
            <View className="flex-row items-center justify-between gap-3 px-4 py-3">
              <View className="min-w-0 flex-1">
                <AppText className="text-sm font-semibold text-foreground">
                  {adjustment.label}
                </AppText>
                <AppText className="mt-0.5 text-[13px] capitalize text-muted">
                  {adjustment.kind.replaceAll("_", " ")}
                  {adjustment.affects_total ? "" : " · not in total"}
                </AppText>
              </View>
              <AppText className="shrink-0 text-sm font-semibold text-foreground">
                {formatMoneyFromCents(adjustment.amount_cents)}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </>
  );
};

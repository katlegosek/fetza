import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { AppText } from "@/components";
import type { BillSummary } from "@/services/bills/types";
import { formatMoneyFromCents } from "@/utils/money";

export type BillDetailTotalsCardProps = {
  summary: BillSummary;
};

export const BillDetailTotalsCard = ({
  summary,
}: BillDetailTotalsCardProps) => {
  const { bill, totals } = summary;

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3 rounded-2xl border border-violet-200/70 bg-violet-50 p-4 shadow-sm shadow-violet-950/5 dark:border-violet-900/45 dark:bg-violet-950/40 dark:shadow-none">
        <View className="size-11 shrink-0 items-center justify-center rounded-full bg-violet-200/90 dark:bg-violet-500/25">
          <Ionicons name="document-text-outline" size={22} color="#7c3aed" />
        </View>
        <View className="min-w-0 flex-1">
          <AppText className="text-base font-bold text-foreground">
            Bill total
          </AppText>
          <AppText className="mt-0.5 text-sm text-muted">
            {bill.items_count} {bill.items_count === 1 ? "item" : "items"} ·{" "}
            {bill.assigned_items_count} assigned
          </AppText>
        </View>
        <AppText className="shrink-0 text-base font-bold text-foreground">
          {formatMoneyFromCents(totals.bill_total_cents)}
        </AppText>
      </View>

      <View className="flex-row gap-3">
        <View className="min-w-0 flex-1 rounded-2xl border border-stone-200/40 bg-white px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
          <AppText className="text-[12px] font-medium text-muted">
            Assigned
          </AppText>
          <AppText className="mt-1 text-base font-semibold text-foreground">
            {formatMoneyFromCents(totals.assigned_total_cents)}
          </AppText>
        </View>
        <View className="min-w-0 flex-1 rounded-2xl border border-stone-200/40 bg-white px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
          <AppText className="text-[12px] font-medium text-muted">
            Unassigned
          </AppText>
          <AppText className="mt-1 text-base font-semibold text-foreground">
            {formatMoneyFromCents(totals.unassigned_total_cents)}
          </AppText>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="min-w-0 flex-1 rounded-2xl border border-stone-200/40 bg-white px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
          <AppText className="text-[12px] font-medium text-muted">
            Outstanding
          </AppText>
          <AppText className="mt-1 text-base font-semibold text-foreground">
            {formatMoneyFromCents(totals.outstanding_total_cents)}
          </AppText>
        </View>
        <View className="min-w-0 flex-1 rounded-2xl border border-stone-200/40 bg-white px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
          <AppText className="text-[12px] font-medium text-muted">
            Settled
          </AppText>
          <AppText className="mt-1 text-base font-semibold text-foreground">
            {formatMoneyFromCents(totals.settled_total_cents)}
          </AppText>
        </View>
      </View>
    </View>
  );
};

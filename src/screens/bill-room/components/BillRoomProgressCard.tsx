import { View } from "react-native";

import { AppText } from "@/components";
import type { BillRoomResponse } from "@/services/bill-room";
import { formatMoneyFromCents } from "@/utils/money";

export const BillRoomProgressCard = ({
  room,
}: {
  room: BillRoomResponse;
}) => {
  const assignedItemIds = new Set(
    room.item_assignments.map((assignment) => assignment.receipt_item_id),
  );
  const assignedItems = assignedItemIds.size;
  const totalItems = room.receipt_items.length;
  const unclaimedItems = totalItems - assignedItems;
  const assignedTotalCents = room.item_assignments.reduce(
    (sum, assignment) => sum + assignment.amount_cents,
    0,
  );
  const progress = totalItems === 0 ? 0 : assignedItems / totalItems;

  return (
    <View className="rounded-3xl border border-borderSubtle bg-background p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View>
          <AppText className="text-lg font-bold text-foreground">
            Claim progress
          </AppText>
          <AppText className="mt-1 text-sm text-muted">
            {assignedItems} of {totalItems} items claimed
          </AppText>
        </View>
        <AppText className="text-lg font-bold text-foreground">
          {Math.round(progress * 100)}%
        </AppText>
      </View>

      <View className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-neutral-800">
        <View
          className="h-full rounded-full bg-foreground"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-stone-50 px-4 py-3 dark:bg-neutral-900">
          <AppText className="text-xs uppercase tracking-wide text-muted">
            Unclaimed
          </AppText>
          <AppText className="mt-1 text-xl font-bold text-foreground">
            {unclaimedItems}
          </AppText>
        </View>
        <View className="flex-1 rounded-2xl bg-stone-50 px-4 py-3 dark:bg-neutral-900">
          <AppText className="text-xs uppercase tracking-wide text-muted">
            Assigned
          </AppText>
          <AppText className="mt-1 text-xl font-bold text-foreground">
            {formatMoneyFromCents(assignedTotalCents)}
          </AppText>
        </View>
      </View>
    </View>
  );
};

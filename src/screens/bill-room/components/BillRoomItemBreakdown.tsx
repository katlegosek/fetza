import { View } from "react-native";

import { AppText } from "@/components";
import type { BillRoomResponse } from "@/services/bill-room";
import { formatMoneyFromCents } from "@/utils/money";

export const BillRoomItemBreakdown = ({
  room,
}: {
  room: BillRoomResponse;
}) => {
  const assignmentsByItem = new Map<number, number>();
  for (const assignment of room.item_assignments) {
    assignmentsByItem.set(
      assignment.receipt_item_id,
      (assignmentsByItem.get(assignment.receipt_item_id) ?? 0) + 1,
    );
  }

  const sections = [
    {
      title: "Unclaimed items",
      items: room.receipt_items.filter(
        (item) => !assignmentsByItem.has(item.id),
      ),
    },
    {
      title: "Claimed items",
      items: room.receipt_items.filter(
        (item) => assignmentsByItem.get(item.id) === 1,
      ),
    },
    {
      title: "Shared items",
      items: room.receipt_items.filter(
        (item) => (assignmentsByItem.get(item.id) ?? 0) > 1,
      ),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <View className="rounded-3xl border border-borderSubtle bg-background p-5">
      <AppText className="text-lg font-bold text-foreground">Breakdown</AppText>
      {sections.map((section) => (
        <View className="mt-4" key={section.title}>
          <AppText className="text-xs font-bold uppercase tracking-wide text-muted">
            {section.title}
          </AppText>
          {section.items.map((item) => (
            <View
              className="mt-2 flex-row items-center justify-between border-b border-borderSubtle pb-2"
              key={item.id}
            >
              <AppText className="mr-4 flex-1 text-foreground">
                {item.name}
              </AppText>
              <AppText className="font-semibold text-foreground">
                {formatMoneyFromCents(item.total_cents)}
              </AppText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

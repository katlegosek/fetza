import { View } from "react-native";

import { AppText, ChatListIconAvatar, ChatListRow } from "@/components";
import type { BillRoomResponse } from "@/services/bill-room";
import { getReceiptItemIcon } from "@/utils/get-receipt-item-icon";
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
    <View className="overflow-hidden rounded-3xl border border-borderSubtle bg-background">
      <AppText className="px-4 pb-1 pt-4 text-lg font-bold text-foreground">
        Breakdown
      </AppText>
      {sections.map((section) => (
        <View key={section.title}>
          <AppText className="px-4 pb-1 pt-3 text-xs font-bold uppercase tracking-wide text-muted">
            {section.title}
          </AppText>
          {section.items.map((item, index) => (
            <ChatListRow
              key={item.id}
              leading={
                <ChatListIconAvatar
                  name={getReceiptItemIcon(item.name)}
                  size="md"
                />
              }
              showDivider={index < section.items.length - 1}
              size="md"
              title={item.name}
              titleNumberOfLines={2}
              trailingBottom={formatMoneyFromCents(item.total_cents)}
            />
          ))}
        </View>
      ))}
      <View className="h-2" />
    </View>
  );
};

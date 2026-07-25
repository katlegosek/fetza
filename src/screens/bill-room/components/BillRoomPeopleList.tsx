import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components";
import { useThemeColors } from "@/hooks";
import type { BillRoomResponse } from "@/services/bill-room";
import { formatMoneyFromCents } from "@/utils/money";

export const BillRoomPeopleList = ({
  room,
  editable,
  onAdd,
  onManage,
}: {
  room: BillRoomResponse;
  editable: boolean;
  onAdd: () => void;
  onManage: (
    participant: BillRoomResponse["bill_participants"][number],
  ) => void;
}) => {
  const colors = useThemeColors();
  const participants = room.bill_participants;
  const guests = participants.filter((participant) => !participant.is_host);
  const totalsByParticipant = new Map<
    number,
    { amountCents: number; itemIds: Set<number> }
  >();

  for (const assignment of room.item_assignments) {
    const current = totalsByParticipant.get(assignment.bill_participant_id) ?? {
      amountCents: 0,
      itemIds: new Set<number>(),
    };
    current.amountCents += assignment.amount_cents;
    current.itemIds.add(assignment.receipt_item_id);
    totalsByParticipant.set(assignment.bill_participant_id, current);
  }

  return (
    <View className="rounded-3xl border border-borderSubtle bg-background p-5">
      <View className="flex-row items-center justify-between">
        <AppText className="text-lg font-bold text-foreground">People</AppText>
        <Pressable
          accessibilityLabel="Add person manually"
          className="flex-row items-center gap-1 rounded-full border border-borderSubtle px-3 py-2 active:opacity-70"
          disabled={!editable}
          onPress={onAdd}
        >
          <Ionicons color={colors.foreground} name="add" size={18} />
          <AppText className="text-sm font-semibold text-foreground">
            Add
          </AppText>
        </Pressable>
      </View>
      <View className="mt-3 gap-2">
        {participants.map((participant) => {
          const totals = totalsByParticipant.get(participant.id);
          const itemCount = totals?.itemIds.size ?? 0;

          return (
            <Pressable
              accessibilityLabel={
                participant.is_host
                  ? `${participant.name}, host`
                  : `Manage ${participant.name}`
              }
              className="flex-row items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 active:opacity-70 dark:bg-neutral-900"
              disabled={participant.is_host || !editable}
              key={participant.id}
              onPress={() => onManage(participant)}
            >
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-2">
                  <AppText className="font-semibold text-foreground">
                    {participant.name}
                  </AppText>
                  {participant.is_host ? (
                    <AppText className="text-[10px] font-bold uppercase tracking-wide text-muted">
                      Host
                    </AppText>
                  ) : null}
                </View>
                <AppText className="mt-1 text-xs text-muted">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </AppText>
              </View>
              <View className="items-end">
                <AppText className="font-bold text-foreground">
                  {formatMoneyFromCents(totals?.amountCents ?? 0)}
                </AppText>
                {!participant.is_host ? (
                  <Ionicons
                    color={colors.muted}
                    name="chevron-forward"
                    size={16}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {guests.length === 0 ? (
        <AppText className="mt-3 text-sm leading-5 text-muted">
          No one has joined yet. Share the link or add someone manually.
        </AppText>
      ) : null}
    </View>
  );
};

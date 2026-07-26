import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AppText, ChatListAvatar, ChatListRow } from "@/components";
import { useThemeColors } from "@/hooks";
import { avatarTonesForPaletteIndex } from "@/lib/member-avatar-tones";
import type { BillRoomResponse } from "@/services/bill-room";
import { formatMoneyFromCents } from "@/utils/money";
import { participantInitials } from "@/utils/participant";

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
    <View className="overflow-hidden rounded-3xl border border-borderSubtle bg-background">
      <View className="flex-row items-center justify-between px-4 pb-1 pt-4">
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

      <View>
        {participants.map((participant, index) => {
          const totals = totalsByParticipant.get(participant.id);
          const itemCount = totals?.itemIds.size ?? 0;
          const tones =
            participant.avatar_background_color && participant.avatar_text_color
              ? {
                  avatarBackgroundColor: participant.avatar_background_color,
                  avatarTextColor: participant.avatar_text_color,
                }
              : avatarTonesForPaletteIndex(index);
          const canManage = !participant.is_host && editable;

          return (
            <ChatListRow
              key={participant.id}
              accessibilityLabel={
                participant.is_host
                  ? `${participant.name}, host`
                  : `Manage ${participant.name}`
              }
              chevron={canManage}
              leading={
                <ChatListAvatar
                  backgroundColor={tones.avatarBackgroundColor}
                  label={participantInitials(
                    participant.name,
                    participant.initials,
                  )}
                  size="md"
                  textColor={tones.avatarTextColor}
                />
              }
              preview={`${itemCount} ${itemCount === 1 ? "item" : "items"}${
                participant.is_host ? " · Host" : ""
              }`}
              showDivider={index < participants.length - 1}
              size="md"
              title={participant.name}
              trailingBottom={formatMoneyFromCents(totals?.amountCents ?? 0)}
              onPress={canManage ? () => onManage(participant) : undefined}
            />
          );
        })}
      </View>

      {guests.length === 0 ? (
        <AppText className="px-4 pb-4 text-sm leading-5 text-muted">
          No one has joined yet. Share the link or add someone manually.
        </AppText>
      ) : (
        <View className="h-2" />
      )}
    </View>
  );
};

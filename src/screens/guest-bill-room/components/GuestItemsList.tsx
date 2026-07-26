import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppText, ChatListIconAvatar, ChatListRow } from "@/components";
import { useThemeColors } from "@/hooks";
import type { GuestBillRoomResponse } from "@/services/guest-bill-room";
import { getReceiptItemIcon } from "@/utils/get-receipt-item-icon";
import { formatMoneyFromCents } from "@/utils/money";

export const GuestItemsList = ({
  room,
  pendingItemId,
  onToggleClaim,
}: {
  room: GuestBillRoomResponse;
  pendingItemId: number | null;
  onToggleClaim: (receiptItemId: number, claimed: boolean) => void;
}) => {
  const colors = useThemeColors();
  const participantById = new Map(
    room.participants.map((participant) => [participant.id, participant]),
  );
  const assignmentsByItem = new Map<
    number,
    GuestBillRoomResponse["item_assignments"]
  >();

  for (const assignment of room.item_assignments) {
    const current = assignmentsByItem.get(assignment.receipt_item_id) ?? [];
    assignmentsByItem.set(assignment.receipt_item_id, [...current, assignment]);
  }

  return (
    <View className="-mx-4">
      {room.receipt_items.map((item, index) => {
        const assignments = assignmentsByItem.get(item.id) ?? [];
        const claimedByMe = assignments.some(
          (assignment) =>
            assignment.bill_participant_id === room.current_participant_id,
        );
        const claimantNames = assignments
          .map(
            (assignment) =>
              participantById.get(assignment.bill_participant_id)?.name,
          )
          .filter((name): name is string => !!name);
        const isPending = pendingItemId === item.id;
        const roomOpen = room.bill.session_status === "open";
        const preview =
          claimantNames.length === 0
            ? "Not claimed yet"
            : `Claimed by ${claimantNames.join(", ")}`;

        return (
          <ChatListRow
            key={item.id}
            footer={
              <View className="px-4 pb-3">
                {room.current_participant_id ? (
                  <Pressable
                    accessibilityLabel={`${claimedByMe ? "Unclaim" : "Claim"} ${item.name}`}
                    className={
                      claimedByMe
                        ? "flex-row items-center justify-center gap-2 rounded-2xl border border-foreground px-4 py-2.5"
                        : "flex-row items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-2.5"
                    }
                    disabled={isPending || !roomOpen}
                    onPress={() => onToggleClaim(item.id, claimedByMe)}
                  >
                    {isPending ? (
                      <ActivityIndicator
                        color={
                          claimedByMe ? colors.foreground : colors.background
                        }
                      />
                    ) : (
                      <>
                        <Ionicons
                          color={
                            claimedByMe ? colors.foreground : colors.background
                          }
                          name={
                            claimedByMe
                              ? "checkmark-circle"
                              : "add-circle-outline"
                          }
                          size={18}
                        />
                        <AppText
                          className={
                            claimedByMe
                              ? "font-semibold text-foreground"
                              : "font-semibold text-background"
                          }
                        >
                          {claimedByMe ? "Claimed by you" : "Claim this item"}
                        </AppText>
                      </>
                    )}
                  </Pressable>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name="lock-closed"
                      size={15}
                      color={colors.muted}
                    />
                    <AppText className="text-sm text-muted">
                      Join above to claim this item
                    </AppText>
                  </View>
                )}
              </View>
            }
            leading={
              <ChatListIconAvatar
                name={getReceiptItemIcon(item.name)}
                size="md"
              />
            }
            preview={preview}
            showDivider={index < room.receipt_items.length - 1}
            size="md"
            title={item.name}
            titleNumberOfLines={2}
            trailingBottom={formatMoneyFromCents(item.total_cents)}
          />
        );
      })}
    </View>
  );
};

import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppText } from "@/components";
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
    <View className="gap-3">
      {room.receipt_items.map((item) => {
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

        return (
          <View
            className="rounded-3xl border border-borderSubtle bg-background p-5"
            key={item.id}
          >
            <View className="flex-row items-start justify-between gap-4">
              <View className="size-10 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
                <Ionicons
                  color="#7c3aed"
                  name={getReceiptItemIcon(item.name)}
                  size={20}
                />
              </View>
              <View className="min-w-0 flex-1">
                <AppText className="text-lg font-semibold text-foreground">
                  {item.name}
                </AppText>
                <AppText className="mt-1 text-sm text-muted">
                  {claimantNames.length === 0
                    ? "Not claimed yet"
                    : `Claimed by ${claimantNames.join(", ")}`}
                </AppText>
              </View>
              <AppText className="text-lg font-bold text-foreground">
                {formatMoneyFromCents(item.total_cents)}
              </AppText>
            </View>

            {room.current_participant_id ? (
              <Pressable
                accessibilityLabel={`${claimedByMe ? "Unclaim" : "Claim"} ${item.name}`}
                className={
                  claimedByMe
                    ? "mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-foreground px-4 py-3"
                    : "mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3"
                }
                disabled={isPending || !roomOpen}
                onPress={() => onToggleClaim(item.id, claimedByMe)}
              >
                {isPending ? (
                  <ActivityIndicator
                    color={claimedByMe ? colors.foreground : colors.background}
                  />
                ) : (
                  <>
                    <Ionicons
                      color={
                        claimedByMe ? colors.foreground : colors.background
                      }
                      name={
                        claimedByMe ? "checkmark-circle" : "add-circle-outline"
                      }
                      size={20}
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
              <View className="mt-4 flex-row items-center gap-2">
                <Ionicons name="lock-closed" size={15} color={colors.muted} />
                <AppText className="text-sm text-muted">
                  Join above to claim this item
                </AppText>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

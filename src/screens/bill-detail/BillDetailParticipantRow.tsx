import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components";
import { useThemeColors } from "@/hooks";
import { avatarTonesForPaletteIndex } from "@/lib/member-avatar-tones";
import type { BillSummaryParticipant } from "@/services/bills/types";
import { formatMoneyFromCents } from "@/utils/money";
import { participantInitials } from "@/utils/participant";

export type BillDetailParticipantRowProps = {
  participant: BillSummaryParticipant;
  index: number;
  onToggleSettled: (participant: BillSummaryParticipant) => void;
};

export const BillDetailParticipantRow = ({
  participant,
  index,
  onToggleSettled,
}: BillDetailParticipantRowProps) => {
  const colors = useThemeColors();
  const tones =
    participant.avatar_background_color && participant.avatar_text_color
      ? {
          avatarBackgroundColor: participant.avatar_background_color,
          avatarTextColor: participant.avatar_text_color,
        }
      : avatarTonesForPaletteIndex(index);

  const settled = participant.settled;
  const toggleLabel = settled
    ? `Mark ${participant.name} as not paid`
    : `Mark ${participant.name} as paid`;

  return (
    <View className="flex-row items-center gap-2 px-4 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={toggleLabel}
        accessibilityState={{ checked: settled }}
        className="shrink-0 active:opacity-80"
        hitSlop={8}
        onPress={() => onToggleSettled(participant)}
      >
        <View
          className="size-10 items-center justify-center rounded-full border-2"
          style={{
            borderColor: settled ? "#059669" : colors.borderSubtle,
            backgroundColor: settled ? "#d1fae5" : "transparent",
          }}
        >
          {settled ? (
            <Ionicons name="checkmark" size={22} color="#059669" />
          ) : (
            <View className="size-4 rounded-full border border-stone-300 dark:border-neutral-600" />
          )}
        </View>
      </Pressable>

      <View
        className="size-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: tones.avatarBackgroundColor }}
      >
        <AppText
          className="text-[12px] font-bold"
          style={{ color: tones.avatarTextColor }}
        >
          {participantInitials(participant.name, participant.initials)}
        </AppText>
      </View>
      <View className="min-w-0 flex-1">
        <AppText
          className="text-sm font-semibold text-foreground"
          numberOfLines={1}
        >
          {participant.name}
        </AppText>
        <AppText className="mt-0.5 text-[13px] leading-snug text-muted">
          {participant.assigned_items_count}{" "}
          {participant.assigned_items_count === 1 ? "item" : "items"}
          {participant.is_host ? " · Host" : ""}
        </AppText>
      </View>
      <View className="shrink-0 flex-row items-center gap-1.5">
        {settled ? (
          <View className="flex-row items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 dark:bg-emerald-950/80">
            <Ionicons name="checkmark-circle" size={14} color="#059669" />
            <AppText className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              Paid
            </AppText>
          </View>
        ) : null}
        <AppText
          className="text-sm font-semibold"
          style={{
            fontVariant: ["tabular-nums"],
            color: settled ? colors.muted : colors.foreground,
          }}
        >
          {formatMoneyFromCents(participant.amount_due_cents)}
        </AppText>
      </View>
    </View>
  );
};

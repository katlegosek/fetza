import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AppText, ChatListAvatar, ChatListRow } from "@/components";
import { useThemeColors } from "@/hooks";
import { avatarTonesForPaletteIndex } from "@/lib/member-avatar-tones";
import type { BillSummaryParticipant } from "@/services/bills/types";
import { formatMoneyFromCents } from "@/utils/money";
import { participantInitials } from "@/utils/participant";

export type BillDetailParticipantRowProps = {
  participant: BillSummaryParticipant;
  index: number;
  showDivider?: boolean;
  onToggleSettled: (participant: BillSummaryParticipant) => void;
};

export const BillDetailParticipantRow = ({
  participant,
  index,
  showDivider = false,
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
  const preview = `${participant.assigned_items_count} ${
    participant.assigned_items_count === 1 ? "item" : "items"
  }${participant.is_host ? " · Host" : ""}`;

  return (
    <ChatListRow
      dividerClassName="ml-[108px]"
      leading={
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={toggleLabel}
            accessibilityState={{ checked: settled }}
            className="shrink-0 active:opacity-80"
            hitSlop={8}
            onPress={() => onToggleSettled(participant)}
          >
            <View
              className="size-7 items-center justify-center rounded-full border-2"
              style={{
                borderColor: settled ? "#059669" : colors.borderSubtle,
                backgroundColor: settled ? "#d1fae5" : "transparent",
              }}
            >
              {settled ? (
                <Ionicons name="checkmark" size={16} color="#059669" />
              ) : null}
            </View>
          </Pressable>
          <ChatListAvatar
            backgroundColor={tones.avatarBackgroundColor}
            label={participantInitials(participant.name, participant.initials)}
            size="md"
            textColor={tones.avatarTextColor}
          />
        </View>
      }
      preview={preview}
      showDivider={showDivider}
      size="md"
      title={participant.name}
      trailingBottom={
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
            className="text-[15px] font-medium"
            style={{
              fontVariant: ["tabular-nums"],
              color: settled ? colors.muted : colors.foreground,
            }}
          >
            {formatMoneyFromCents(participant.amount_due_cents)}
          </AppText>
        </View>
      }
    />
  );
};

import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AnimatedZarAmount, AppText } from "@/components";
import { useThemeColors } from "@/hooks";
import { formatZAR } from "@/lib/helper";
import { avatarTonesForPaletteIndex } from "@/lib/member-avatar-tones";
import type { SettlementMap } from "@/lib/member-settlement-storage";
import { isMemberSettled } from "@/lib/member-settlement-storage";
import type { DraftBill } from "@/mocks/review-draft.mock";
import type { SummaryMember } from "@/screens/summary/summary.constants";
import {
  type AssignmentMap,
  assignedLineCountForMember,
} from "@/screens/summary/summary.helpers";
import { initials, isYouMember } from "@/screens/summary/summary.helpers";

export type SummaryParticipantRowProps = {
  member: SummaryMember;
  index: number;
  draft: DraftBill;
  assignments: AssignmentMap;
  owedCents: number;
  settlement: SettlementMap;
  onPress: (memberId: string) => void;
  onLongPress: (memberId: string) => void;
};

export const SummaryParticipantRow = ({
  member,
  index,
  draft,
  assignments,
  owedCents,
  settlement,
  onPress,
  onLongPress,
}: SummaryParticipantRowProps) => {
  const colors = useThemeColors();
  const lineCountForMember = assignedLineCountForMember(
    draft,
    assignments,
    member.id,
  );
  const listTones = avatarTonesForPaletteIndex(index);
  const settled = isMemberSettled(settlement, member.id);

  return (
    <Pressable
      accessibilityHint="Tap for share. Long press to mark paid or unpaid."
      accessibilityLabel={`${member.name}, ${lineCountForMember} items, ${formatZAR(owedCents)}`}
      accessibilityRole="button"
      className="active:bg-stone-50 dark:active:bg-neutral-800/50"
      delayLongPress={400}
      onLongPress={() => onLongPress(member.id)}
      onPress={() => onPress(member.id)}
    >
      <View className="flex-row items-center gap-2 px-4 py-3">
        <View
          className="size-10 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: listTones.avatarBackgroundColor,
          }}
        >
          <AppText
            className="text-[12px] font-bold"
            style={{ color: listTones.avatarTextColor }}
          >
            {initials(member.name)}
          </AppText>
        </View>
        <View className="min-w-0 flex-1">
          <View className="max-w-full flex-row items-center gap-1 self-start">
            <AppText
              className="min-w-0 shrink text-sm font-semibold text-foreground"
              numberOfLines={1}
            >
              {member.name}
            </AppText>
            {isYouMember(member) ? (
              <View className="shrink-0">
                <Ionicons
                  accessibilityLabel="You"
                  name="ribbon-outline"
                  size={15}
                  color="#7c3aed"
                />
              </View>
            ) : null}
          </View>
          <AppText className="mt-0.5 text-[13px] leading-snug text-muted">
            {lineCountForMember} {lineCountForMember === 1 ? "item" : "items"}
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
          <AnimatedZarAmount
            cents={owedCents}
            style={{
              fontSize: 14,
              fontWeight: "600",
              fontVariant: ["tabular-nums"],
              color: settled ? colors.muted : colors.foreground,
            }}
          />
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </View>
      </View>
    </Pressable>
  );
};

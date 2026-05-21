import { useMemo } from "react";
import { View } from "react-native";

import { type Person, TableScene } from "@/components";
import { avatarTonesForPaletteIndex } from "@/lib/member-avatar-tones";
import type { SettlementMap } from "@/lib/member-settlement-storage";
import { isMemberSettled } from "@/lib/member-settlement-storage";
import type { SummaryMember } from "@/screens/summary/summary.constants";
import {
  initials,
  isYouMember,
  sortMembersYouFirst,
} from "@/screens/summary/summary.helpers";

export type SummaryTableSceneProps = {
  members: SummaryMember[];
  owed: Record<string, number>;
  grandTotalCents: number;
  lineCount: number;
  onMemberPress: (memberId: string) => void;
  onMemberLongPress?: (memberId: string) => void;
  settlement: SettlementMap;
  onListPress: () => void;
  onOpenReceipt: () => void;
};

export const SummaryTableScene = ({
  members,
  owed,
  grandTotalCents,
  lineCount,
  onMemberPress,
  onMemberLongPress,
  onListPress,
  onOpenReceipt,
  settlement,
}: SummaryTableSceneProps) => {
  const ordered = useMemo(() => sortMembersYouFirst(members), [members]);

  const people: Person[] = useMemo(
    () =>
      ordered.map((m, orderIdx) => {
        const tones = avatarTonesForPaletteIndex(orderIdx);
        return {
          id: m.id,
          name: m.name,
          initials: initials(m.name),
          amountCents: owed[m.id] ?? 0,
          color: tones.avatarBackgroundColor,
          avatarBackgroundColor: tones.avatarBackgroundColor,
          avatarTextColor: tones.avatarTextColor,
          isHost: isYouMember(m),
          isPaid: isMemberSettled(settlement, m.id),
        };
      }),
    [ordered, owed, settlement],
  );

  return (
    <View className="w-full overflow-visible rounded-3xl bg-stone-50 dark:bg-neutral-950/50">
      <TableScene
        itemCount={lineCount}
        key={ordered.map((m) => m.id).join(",")}
        maxVisibleParticipants={8}
        people={people}
        sceneBackgroundColor="transparent"
        showParticipantOverflow={false}
        style={{ marginTop: 0, borderRadius: 0 }}
        totalCents={grandTotalCents}
        onLongPressPerson={
          onMemberLongPress
            ? (p) => {
                onMemberLongPress(p.id);
              }
            : undefined
        }
        onPressMorePeople={onListPress}
        onPressPerson={(p) => {
          onMemberPress(p.id);
        }}
        onPressTable={onOpenReceipt}
      />
    </View>
  );
};

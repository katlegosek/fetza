import { View } from "react-native";

import { AppText } from "@/components";
import type { SettlementMap } from "@/lib/member-settlement-storage";
import type { DraftBill } from "@/mocks/review-draft.mock";
import { SummaryBillTotalCard } from "@/screens/summary/SummaryBillTotalCard";
import { SummaryParticipantRow } from "@/screens/summary/SummaryParticipantRow";
import type { SummaryMember } from "@/screens/summary/summary.constants";
import type { AssignmentMap } from "@/screens/summary/summary.helpers";

export type SummaryParticipantListProps = {
  draft: DraftBill;
  assignments: AssignmentMap;
  members: SummaryMember[];
  owed: Record<string, number>;
  settlement: SettlementMap;
  grandTotalCents: number;
  chevronColor: string;
  onOpenReceipt: () => void;
  onMemberPress: (memberId: string) => void;
  onMemberLongPress: (memberId: string) => void;
};

export const SummaryParticipantList = ({
  draft,
  assignments,
  members,
  owed,
  settlement,
  grandTotalCents,
  chevronColor,
  onOpenReceipt,
  onMemberPress,
  onMemberLongPress,
}: SummaryParticipantListProps) => {
  return (
    <>
      <SummaryBillTotalCard
        chevronColor={chevronColor}
        className="mt-4"
        grandTotalCents={grandTotalCents}
        lineCount={draft.lines.length}
        onOpenReceipt={onOpenReceipt}
      />
      <AppText className="mt-6 text-base font-semibold text-foreground">
        Who owes what
      </AppText>

      <View className="mt-3 overflow-hidden rounded-2xl border border-stone-200/30 bg-background dark:border-neutral-800/45">
        {members.map((member, index) => (
          <View key={member.id}>
            {index > 0 ? (
              <View className="mx-4 h-px bg-stone-200/30 dark:bg-neutral-700/35" />
            ) : null}
            <SummaryParticipantRow
              assignments={assignments}
              draft={draft}
              index={index}
              member={member}
              owedCents={owed[member.id] ?? 0}
              settlement={settlement}
              onLongPress={onMemberLongPress}
              onPress={onMemberPress}
            />
          </View>
        ))}
      </View>
    </>
  );
};

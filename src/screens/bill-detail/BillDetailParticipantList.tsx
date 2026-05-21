import { View } from "react-native";

import { AppText } from "@/components";
import { BillDetailParticipantRow } from "@/screens/bill-detail/BillDetailParticipantRow";
import { sortBillDetailParticipants } from "@/screens/bill-detail/bill-detail.helpers";
import type { BillSummaryParticipant } from "@/services/bills/types";

export type BillDetailParticipantListProps = {
  participants: BillSummaryParticipant[];
  onToggleSettled: (participant: BillSummaryParticipant) => void;
};

export const BillDetailParticipantList = ({
  participants,
  onToggleSettled,
}: BillDetailParticipantListProps) => {
  const ordered = sortBillDetailParticipants(participants);

  return (
    <>
      <AppText className="mt-6 text-base font-semibold text-foreground">
        Who owes what
      </AppText>

      {ordered.length === 0 ? (
        <View className="mt-3 rounded-2xl border border-stone-200/30 bg-background px-4 py-8 dark:border-neutral-800/45">
          <AppText className="text-center text-sm text-muted">
            No participants on this bill yet.
          </AppText>
        </View>
      ) : (
        <View className="mt-3 overflow-hidden rounded-2xl border border-stone-200/30 bg-background dark:border-neutral-800/45">
          {ordered.map((participant, index) => (
            <View key={participant.id}>
              {index > 0 ? (
                <View className="mx-4 h-px bg-stone-200/30 dark:bg-neutral-700/35" />
              ) : null}
              <BillDetailParticipantRow
                participant={participant}
                index={index}
                onToggleSettled={onToggleSettled}
              />
            </View>
          ))}
        </View>
      )}
    </>
  );
};

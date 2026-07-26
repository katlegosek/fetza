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
        <View className="mt-3 py-8">
          <AppText className="text-center text-sm text-muted">
            No participants on this bill yet.
          </AppText>
        </View>
      ) : (
        <View className="-mx-4 mt-1">
          {ordered.map((participant, index) => (
            <BillDetailParticipantRow
              key={participant.id}
              participant={participant}
              index={index}
              showDivider={index < ordered.length - 1}
              onToggleSettled={onToggleSettled}
            />
          ))}
        </View>
      )}
    </>
  );
};

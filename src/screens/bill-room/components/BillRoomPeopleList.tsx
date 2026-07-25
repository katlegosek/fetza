import { View } from "react-native";

import { AppText } from "@/components";
import type { BillRoomResponse } from "@/services/bill-room";

export const BillRoomPeopleList = ({
  participants,
}: {
  participants: BillRoomResponse["bill_participants"];
}) => {
  const guests = participants.filter((participant) => !participant.is_host);

  return (
    <View className="rounded-3xl border border-borderSubtle bg-background p-5">
      <AppText className="text-lg font-bold text-foreground">People</AppText>
      <View className="mt-3 gap-2">
        {participants.map((participant) => (
          <View
            className="flex-row items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 dark:bg-neutral-900"
            key={participant.id}
          >
            <AppText className="font-semibold text-foreground">
              {participant.name}
            </AppText>
            <AppText className="text-xs font-semibold uppercase text-muted">
              {participant.is_host ? "Host" : "Joined"}
            </AppText>
          </View>
        ))}
      </View>
      {guests.length === 0 ? (
        <AppText className="mt-3 text-sm leading-5 text-muted">
          No one has joined yet. Share the link or add someone manually.
        </AppText>
      ) : null}
    </View>
  );
};

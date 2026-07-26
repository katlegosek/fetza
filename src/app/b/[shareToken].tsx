import { useLocalSearchParams } from "expo-router";

import { ScreenErrorState } from "@/components";
import { GuestBillRoomScreen } from "@/screens/guest-bill-room";

export default function GuestBillRoomRoute() {
  const { shareToken: shareTokenParam } = useLocalSearchParams<{
    shareToken?: string | string[];
  }>();
  const shareToken = Array.isArray(shareTokenParam)
    ? shareTokenParam[0]
    : shareTokenParam;

  if (!shareToken) {
    return (
      <ScreenErrorState
        title="Table unavailable"
        message="This table link is incomplete."
      />
    );
  }

  return <GuestBillRoomScreen shareToken={shareToken} />;
}

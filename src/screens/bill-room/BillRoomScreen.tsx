import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/api-error-message";
import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import {
  NoticeBanner,
  ScreenContainer,
  ScreenErrorState,
  ScreenHeader,
  ScreenLoadingState,
} from "@/components";
import { usePullToRefresh } from "@/hooks";
import {
  BillRoomActions,
  BillRoomHeader,
  BillRoomItemBreakdown,
  BillRoomPeopleList,
  BillRoomShareCard,
} from "@/screens/bill-room/components";
import { useBillRoom, useFinalizeBillRoom } from "@/services/bill-room";

export const BillRoomScreen = ({ billId }: { billId: number }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const roomQuery = useBillRoom(billId);
  const finalizeRoom = useFinalizeBillRoom();
  const [actionError, setActionError] = useState<string | null>(null);
  const { refreshing, onRefresh } = usePullToRefresh(roomQuery.refetch);
  const handleBack = useCallback(() => router.back(), [router]);

  const handleFinalize = useCallback(async () => {
    setActionError(null);
    try {
      await finalizeRoom.mutateAsync(billId);
      await invalidateBillQueries(queryClient, billId);
      router.replace({
        pathname: "/scan/summary",
        params: { billId: String(billId) },
      });
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Couldn't finalise the bill. Try again."),
      );
    }
  }, [billId, finalizeRoom, queryClient, router]);

  if (roomQuery.isLoading) {
    return (
      <ScreenLoadingState
        title="Breakdown"
        message="Opening your bill room…"
        loadingAccessibilityLabel="Loading bill room"
        onBack={handleBack}
      />
    );
  }

  if (roomQuery.isError || !roomQuery.data) {
    return (
      <ScreenErrorState
        title="Breakdown"
        message={getApiErrorMessage(
          roomQuery.error,
          "Couldn't load this bill room.",
        )}
        actionLabel="Try again"
        onAction={() => void roomQuery.refetch()}
        onBack={handleBack}
      />
    );
  }

  const room = roomQuery.data;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader
        title="Breakdown"
        topHint={room.bill.receipt_name}
        onBack={handleBack}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          gap: 16,
          padding: 16,
          paddingBottom: insets.bottom + 24,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {actionError ? (
          <NoticeBanner
            icon="alert-circle-outline"
            message={actionError}
            variant="sky"
            onDismiss={() => setActionError(null)}
          />
        ) : null}
        <BillRoomHeader
          status={room.bill.session_status}
          title={room.bill.title}
          totalCents={room.bill.total_cents}
        />
        <BillRoomShareCard
          shareToken={room.bill.share_token}
          shareUrl={room.bill.share_url}
        />
        <BillRoomPeopleList participants={room.bill_participants} />
        <BillRoomItemBreakdown room={room} />
        <BillRoomActions
          isFinalizing={finalizeRoom.isPending}
          onFinalize={() => void handleFinalize()}
          onManualAssign={() =>
            router.push({
              pathname: "/scan/assign",
              params: { billId: String(billId) },
            })
          }
        />
      </ScrollView>
    </ScreenContainer>
  );
};

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
  BillRoomFinalizeSheet,
  BillRoomHeader,
  BillRoomItemBreakdown,
  BillRoomParticipantSheet,
  BillRoomPeopleList,
  BillRoomProgressCard,
  BillRoomShareCard,
} from "@/screens/bill-room/components";
import {
  type BillRoomResponse,
  useBillRoom,
  useFinalizeBillRoom,
} from "@/services/bill-room";
import { useBillParticipants } from "@/services/participants";

type Participant = BillRoomResponse["bill_participants"][number];

const initialsForName = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const BillRoomScreen = ({ billId }: { billId: number }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const roomQuery = useBillRoom(billId);
  const finalizeRoom = useFinalizeBillRoom();
  const participantMutations = useBillParticipants(billId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [participantSheet, setParticipantSheet] = useState<
    { kind: "add" } | { kind: "edit"; participantId: number } | null
  >(null);
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [finalizeSheetOpen, setFinalizeSheetOpen] = useState(false);
  const { refreshing, onRefresh } = usePullToRefresh(roomQuery.refetch);
  const handleBack = useCallback(() => router.back(), [router]);

  const handleFinalize = useCallback(async () => {
    setActionError(null);
    try {
      await finalizeRoom.mutateAsync(billId);
      await invalidateBillQueries(queryClient, billId);
      setFinalizeSheetOpen(false);
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

  const handleSaveParticipant = useCallback(
    async (name: string) => {
      const room = roomQuery.data;
      if (!room || !participantSheet) return;

      setParticipantError(null);
      const initials = initialsForName(name);

      try {
        if (participantSheet.kind === "add") {
          const highestSeatIndex = room.bill_participants.reduce(
            (highest, participant) =>
              Math.max(highest, participant.seat_index ?? -1),
            -1,
          );
          await participantMutations.createParticipant.mutateAsync({
            participant: {
              name,
              initials,
              seat_index: highestSeatIndex + 1,
              is_host: false,
            },
          });
        } else {
          await participantMutations.updateParticipant.mutateAsync({
            participantId: participantSheet.participantId,
            participant: { name, initials },
          });
        }

        setParticipantSheet(null);
        await roomQuery.refetch();
      } catch (error) {
        setParticipantError(
          getApiErrorMessage(error, "Couldn't save this person. Try again."),
        );
      }
    },
    [participantMutations, participantSheet, roomQuery],
  );

  const handleRemoveParticipant = useCallback(async () => {
    if (participantSheet?.kind !== "edit") return;

    setParticipantError(null);
    try {
      await participantMutations.deleteParticipant.mutateAsync(
        participantSheet.participantId,
      );
      setParticipantSheet(null);
      await roomQuery.refetch();
    } catch (error) {
      setParticipantError(
        getApiErrorMessage(error, "Couldn't remove this person. Try again."),
      );
    }
  }, [participantMutations.deleteParticipant, participantSheet, roomQuery]);

  if (roomQuery.isLoading) {
    return (
      <ScreenLoadingState
        title="Breakdown"
        message="Opening your table…"
        loadingAccessibilityLabel="Loading table"
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
          "Couldn't load this table.",
        )}
        actionLabel="Try again"
        onAction={() => void roomQuery.refetch()}
        onBack={handleBack}
      />
    );
  }

  const room = roomQuery.data;
  const assignedItemIds = new Set(
    room.item_assignments.map((assignment) => assignment.receipt_item_id),
  );
  const unclaimedItems = room.receipt_items.length - assignedItemIds.size;
  const selectedParticipant: Participant | null =
    participantSheet?.kind === "edit"
      ? (room.bill_participants.find(
          (participant) => participant.id === participantSheet.participantId,
        ) ?? null)
      : null;
  const participantBusy =
    participantMutations.createParticipant.isPending ||
    participantMutations.updateParticipant.isPending ||
    participantMutations.deleteParticipant.isPending;
  const roomEditable = room.bill.session_status === "open";

  return (
    <ScreenContainer className="flex-1 bg-canvas">
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
        <BillRoomProgressCard room={room} />
        <BillRoomShareCard
          shareToken={room.bill.share_token}
          shareUrl={room.bill.share_url}
        />
        <BillRoomPeopleList
          editable={roomEditable}
          room={room}
          onAdd={() => {
            setParticipantError(null);
            setParticipantSheet({ kind: "add" });
          }}
          onManage={(participant) => {
            setParticipantError(null);
            setParticipantSheet({
              kind: "edit",
              participantId: participant.id,
            });
          }}
        />
        <BillRoomItemBreakdown room={room} />
        <BillRoomActions
          isFinalizing={finalizeRoom.isPending}
          roomOpen={roomEditable}
          onFinalize={() => setFinalizeSheetOpen(true)}
          onManualAssign={() =>
            router.push({
              pathname: "/scan/assign",
              params: { billId: String(billId) },
            })
          }
          onViewSummary={() =>
            router.push({
              pathname: "/scan/summary",
              params: { billId: String(billId) },
            })
          }
        />
      </ScrollView>

      <BillRoomParticipantSheet
        bottomInset={insets.bottom}
        busy={participantBusy}
        error={participantError}
        participant={selectedParticipant}
        visible={participantSheet !== null}
        onClose={() => {
          setParticipantError(null);
          setParticipantSheet(null);
        }}
        onRemove={
          selectedParticipant ? () => void handleRemoveParticipant() : null
        }
        onSave={(name) => void handleSaveParticipant(name)}
      />

      <BillRoomFinalizeSheet
        bottomInset={insets.bottom}
        isFinalizing={finalizeRoom.isPending}
        unclaimedItems={unclaimedItems}
        visible={finalizeSheetOpen}
        onClose={() => setFinalizeSheetOpen(false)}
        onConfirm={() => void handleFinalize()}
      />
    </ScreenContainer>
  );
};

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/api-error-message";
import {
  AppText,
  NoticeBanner,
  ScreenContainer,
  ScreenErrorState,
  ScreenLoadingState,
} from "@/components";
import {
  GuestIdentityCard,
  GuestItemsList,
  GuestJoinCard,
} from "@/screens/guest-bill-room/components";
import {
  guestBillRoomQueryKeys,
  useClaimGuestBillRoomItem,
  useGuestBillRoom,
  useJoinGuestBillRoom,
  useLeaveGuestBillRoom,
  useRenameGuestBillRoomGuest,
} from "@/services/guest-bill-room";
import { formatMoneyFromCents } from "@/utils/money";

export const GuestBillRoomScreen = ({
  shareToken,
}: {
  shareToken: string;
}) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const roomQuery = useGuestBillRoom(shareToken);
  const joinRoom = useJoinGuestBillRoom();
  const claimItem = useClaimGuestBillRoomItem();
  const renameGuest = useRenameGuestBillRoomGuest();
  const leaveRoom = useLeaveGuestBillRoom();
  const [name, setName] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);

  const replaceRoomData = useCallback(
    (room: NonNullable<typeof roomQuery.data>) => {
      queryClient.setQueryData(guestBillRoomQueryKeys.detail(shareToken), room);
    },
    [queryClient, shareToken],
  );

  const handleJoin = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setJoinError("Enter your name to join.");
      return;
    }

    setJoinError(null);
    try {
      const room = await joinRoom.mutateAsync({
        shareToken,
        name: trimmedName,
      });
      replaceRoomData(room);
    } catch (error) {
      setJoinError(
        getApiErrorMessage(error, "Couldn't join this bill room. Try again."),
      );
    }
  }, [joinRoom, name, replaceRoomData, shareToken]);

  const handleToggleClaim = useCallback(
    async (receiptItemId: number, claimed: boolean) => {
      setClaimError(null);
      setPendingItemId(receiptItemId);
      try {
        const room = await claimItem.mutateAsync({
          shareToken,
          receiptItemId,
          claimed,
        });
        replaceRoomData(room);
      } catch (error) {
        setClaimError(
          getApiErrorMessage(error, "Couldn't update your claim. Try again."),
        );
      } finally {
        setPendingItemId(null);
      }
    },
    [claimItem, replaceRoomData, shareToken],
  );

  const handleRename = useCallback(
    async (nextName: string) => {
      setSessionError(null);
      try {
        const room = await renameGuest.mutateAsync({
          shareToken,
          name: nextName,
        });
        replaceRoomData(room);
      } catch (error) {
        setSessionError(
          getApiErrorMessage(error, "Couldn't update your name. Try again."),
        );
      }
    },
    [renameGuest, replaceRoomData, shareToken],
  );

  const handleLeave = useCallback(async () => {
    setSessionError(null);
    try {
      const room = await leaveRoom.mutateAsync(shareToken);
      setName("");
      replaceRoomData(room);
    } catch (error) {
      setSessionError(
        getApiErrorMessage(error, "Couldn't leave this bill room. Try again."),
      );
    }
  }, [leaveRoom, replaceRoomData, shareToken]);

  if (roomQuery.isLoading) {
    return (
      <ScreenLoadingState
        title="Fetza"
        message="Opening the bill room…"
        loadingAccessibilityLabel="Loading shared bill room"
      />
    );
  }

  if (roomQuery.isError || !roomQuery.data) {
    return (
      <ScreenErrorState
        title="Bill room unavailable"
        message={getApiErrorMessage(
          roomQuery.error,
          "This link may be invalid or the room is no longer available.",
        )}
        actionLabel="Try again"
        onAction={() => void roomQuery.refetch()}
      />
    );
  }

  const room = roomQuery.data;
  const currentParticipant = room.participants.find(
    (participant) => participant.id === room.current_participant_id,
  );
  const roomFinalized = room.bill.session_status === "finalized";

  return (
    <ScreenContainer className="flex-1 bg-stone-50 dark:bg-neutral-950">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: insets.bottom + 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={roomQuery.isRefetching}
            onRefresh={() => void roomQuery.refetch()}
          />
        }
      >
        <View className="w-full max-w-2xl px-4 py-8 md:px-8">
          <View className="mb-8 flex-row items-center justify-between">
            <AppText className="text-xl font-black tracking-tight text-foreground">
              fetza
            </AppText>
            <View className="rounded-full border border-borderSubtle bg-background px-3 py-1.5">
              <AppText className="text-xs font-semibold uppercase tracking-wide text-muted">
                {roomFinalized ? "Finalised" : "Live bill"}
              </AppText>
            </View>
          </View>

          <View className="mb-5 rounded-3xl bg-foreground p-6">
            <AppText className="text-sm font-semibold text-background/70">
              YOU’VE BEEN INVITED TO
            </AppText>
            <AppText className="mt-2 text-3xl font-bold text-background">
              {room.bill.title}
            </AppText>
            <AppText className="mt-4 text-4xl font-black text-background">
              {formatMoneyFromCents(room.bill.total_cents)}
            </AppText>
            <AppText className="mt-2 text-sm text-background/70">
              {room.receipt_items.length}{" "}
              {room.receipt_items.length === 1 ? "item" : "items"} on this bill
            </AppText>
          </View>

          {roomFinalized ? (
            <NoticeBanner
              className="mb-5"
              icon="checkmark-circle-outline"
              message="This bill has been finalised. Claims are now read-only."
              variant="violet"
            />
          ) : null}

          {!currentParticipant && !roomFinalized ? (
            <View className="mb-5">
              <GuestJoinCard
                error={joinError}
                isJoining={joinRoom.isPending}
                name={name}
                onChangeName={setName}
                onJoin={() => void handleJoin()}
              />
            </View>
          ) : null}

          {currentParticipant ? (
            <GuestIdentityCard
              isLeaving={leaveRoom.isPending}
              isRenaming={renameGuest.isPending}
              name={currentParticipant.name}
              readOnly={roomFinalized}
              onLeave={() => void handleLeave()}
              onRename={(nextName) => void handleRename(nextName)}
            />
          ) : null}

          {sessionError ? (
            <NoticeBanner
              className="mb-5"
              icon="alert-circle-outline"
              message={sessionError}
              variant="sky"
              onDismiss={() => setSessionError(null)}
            />
          ) : null}

          {claimError ? (
            <NoticeBanner
              className="mb-5"
              icon="alert-circle-outline"
              message={claimError}
              variant="sky"
              onDismiss={() => setClaimError(null)}
            />
          ) : null}

          <View className="mb-4 flex-row items-end justify-between">
            <View>
              <AppText className="text-2xl font-bold text-foreground">
                Claim your items
              </AppText>
              <AppText className="mt-1 text-sm text-muted">
                You can share an item by claiming it too.
              </AppText>
            </View>
          </View>

          <GuestItemsList
            pendingItemId={pendingItemId}
            room={room}
            onToggleClaim={(itemId, claimed) =>
              void handleToggleClaim(itemId, claimed)
            }
          />

          <AppText className="mt-8 text-center text-xs text-muted">
            One person scans. Everyone claims their own.
          </AppText>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

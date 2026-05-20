import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isApiError } from "@/api/errors";
import {
  AppText,
  Button,
  NoticeBanner,
  ScreenContainer,
  ScreenHeader,
} from "@/components";
import {
  useBillParticipants,
  useBillSummary,
  usePullToRefresh,
  useThemeColors,
} from "@/hooks";
import { avatarTonesForPaletteIndex } from "@/lib/member-avatar-tones";
import type {
  BillSummary,
  BillSummaryAdjustment,
  BillSummaryParticipant,
} from "@/types/api";
import { formatMoneyFromCents } from "@/utils/money";
import { participantInitials } from "@/utils/participant";

function parseBillId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function TotalsCard({ summary }: { summary: BillSummary }) {
  const { bill, totals } = summary;

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3 rounded-2xl border border-violet-200/70 bg-violet-50 p-4 shadow-sm shadow-violet-950/5 dark:border-violet-900/45 dark:bg-violet-950/40 dark:shadow-none">
        <View className="size-11 shrink-0 items-center justify-center rounded-full bg-violet-200/90 dark:bg-violet-500/25">
          <Ionicons name="document-text-outline" size={22} color="#7c3aed" />
        </View>
        <View className="min-w-0 flex-1">
          <AppText className="text-base font-bold text-foreground">
            Bill total
          </AppText>
          <AppText className="mt-0.5 text-sm text-muted">
            {bill.items_count} {bill.items_count === 1 ? "item" : "items"} ·{" "}
            {bill.assigned_items_count} assigned
          </AppText>
        </View>
        <AppText className="shrink-0 text-base font-bold text-foreground">
          {formatMoneyFromCents(totals.bill_total_cents)}
        </AppText>
      </View>

      <View className="flex-row gap-3">
        <View className="min-w-0 flex-1 rounded-2xl border border-stone-200/40 bg-white px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
          <AppText className="text-[12px] font-medium text-muted">
            Assigned
          </AppText>
          <AppText className="mt-1 text-base font-semibold text-foreground">
            {formatMoneyFromCents(totals.assigned_total_cents)}
          </AppText>
        </View>
        <View className="min-w-0 flex-1 rounded-2xl border border-stone-200/40 bg-white px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
          <AppText className="text-[12px] font-medium text-muted">
            Unassigned
          </AppText>
          <AppText className="mt-1 text-base font-semibold text-foreground">
            {formatMoneyFromCents(totals.unassigned_total_cents)}
          </AppText>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="min-w-0 flex-1 rounded-2xl border border-stone-200/40 bg-white px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
          <AppText className="text-[12px] font-medium text-muted">
            Outstanding
          </AppText>
          <AppText className="mt-1 text-base font-semibold text-foreground">
            {formatMoneyFromCents(totals.outstanding_total_cents)}
          </AppText>
        </View>
        <View className="min-w-0 flex-1 rounded-2xl border border-stone-200/40 bg-white px-4 py-3 dark:border-neutral-800/50 dark:bg-neutral-900">
          <AppText className="text-[12px] font-medium text-muted">
            Settled
          </AppText>
          <AppText className="mt-1 text-base font-semibold text-foreground">
            {formatMoneyFromCents(totals.settled_total_cents)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

function ParticipantRow({
  participant,
  index,
  onToggleSettled,
}: {
  participant: BillSummaryParticipant;
  index: number;
  onToggleSettled: (participant: BillSummaryParticipant) => void;
}) {
  const colors = useThemeColors();
  const tones =
    participant.avatar_background_color && participant.avatar_text_color
      ? {
          avatarBackgroundColor: participant.avatar_background_color,
          avatarTextColor: participant.avatar_text_color,
        }
      : avatarTonesForPaletteIndex(index);

  const settled = participant.settled;
  const toggleLabel = settled
    ? `Mark ${participant.name} as not paid`
    : `Mark ${participant.name} as paid`;

  return (
    <View className="flex-row items-center gap-2 px-4 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={toggleLabel}
        accessibilityState={{ checked: settled }}
        className="shrink-0 active:opacity-80"
        hitSlop={8}
        onPress={() => onToggleSettled(participant)}
      >
        <View
          className="size-10 items-center justify-center rounded-full border-2"
          style={{
            borderColor: settled ? "#059669" : colors.borderSubtle,
            backgroundColor: settled ? "#d1fae5" : "transparent",
          }}
        >
          {settled ? (
            <Ionicons name="checkmark" size={22} color="#059669" />
          ) : (
            <View className="size-4 rounded-full border border-stone-300 dark:border-neutral-600" />
          )}
        </View>
      </Pressable>

      <View
        className="size-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: tones.avatarBackgroundColor }}
      >
        <AppText
          className="text-[12px] font-bold"
          style={{ color: tones.avatarTextColor }}
        >
          {participantInitials(participant.name, participant.initials)}
        </AppText>
      </View>
      <View className="min-w-0 flex-1">
        <AppText
          className="text-sm font-semibold text-foreground"
          numberOfLines={1}
        >
          {participant.name}
        </AppText>
        <AppText className="mt-0.5 text-[13px] leading-snug text-muted">
          {participant.assigned_items_count}{" "}
          {participant.assigned_items_count === 1 ? "item" : "items"}
          {participant.is_host ? " · Host" : ""}
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
        <AppText
          className="text-sm font-semibold"
          style={{
            fontVariant: ["tabular-nums"],
            color: settled ? colors.muted : colors.foreground,
          }}
        >
          {formatMoneyFromCents(participant.amount_due_cents)}
        </AppText>
      </View>
    </View>
  );
}

function AdjustmentsSection({
  adjustments,
}: {
  adjustments: BillSummaryAdjustment[];
}) {
  if (adjustments.length === 0) {
    return null;
  }

  return (
    <>
      <AppText className="mt-6 text-base font-semibold text-foreground">
        Receipt adjustments
      </AppText>
      <View className="mt-3 overflow-hidden rounded-2xl border border-stone-200/30 bg-background dark:border-neutral-800/45">
        {adjustments.map((adjustment, index) => (
          <View key={adjustment.id}>
            {index > 0 ? (
              <View className="mx-4 h-px bg-stone-200/30 dark:bg-neutral-700/35" />
            ) : null}
            <View className="flex-row items-center justify-between gap-3 px-4 py-3">
              <View className="min-w-0 flex-1">
                <AppText className="text-sm font-semibold text-foreground">
                  {adjustment.label}
                </AppText>
                <AppText className="mt-0.5 text-[13px] capitalize text-muted">
                  {adjustment.kind.replaceAll("_", " ")}
                  {adjustment.affects_total ? "" : " · not in total"}
                </AppText>
              </View>
              <AppText className="shrink-0 text-sm font-semibold text-foreground">
                {formatMoneyFromCents(adjustment.amount_cents)}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function BillSummaryContent({
  summary,
  onViewReceipt,
  onAssignItems,
  onToggleSettled,
}: {
  summary: BillSummary;
  onViewReceipt: () => void;
  onAssignItems: () => void;
  onToggleSettled: (participant: BillSummaryParticipant) => void;
}) {
  const participants = [...summary.participants].sort((a, b) => {
    const aSeat = a.seat_index ?? Number.MAX_SAFE_INTEGER;
    const bSeat = b.seat_index ?? Number.MAX_SAFE_INTEGER;
    if (aSeat !== bSeat) {
      return aSeat - bSeat;
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <TotalsCard summary={summary} />

      <View className="mt-4 flex-row gap-3">
        <Button
          accessibilityLabel="View receipt"
          className="min-w-0 flex-1 flex-row items-center justify-center gap-2 border border-violet-200/70 bg-white dark:border-violet-900/45 dark:bg-neutral-900"
          onPress={onViewReceipt}
        >
          <Ionicons name="receipt-outline" size={18} color="#7c3aed" />
          <AppText className="text-base font-semibold text-foreground">
            Receipt
          </AppText>
        </Button>
        <Button
          accessibilityLabel="Assign items"
          className="min-w-0 flex-1 flex-row items-center justify-center gap-2 border border-violet-200/70 bg-white dark:border-violet-900/45 dark:bg-neutral-900"
          onPress={onAssignItems}
        >
          <Ionicons name="people-outline" size={18} color="#7c3aed" />
          <AppText className="text-base font-semibold text-foreground">
            Assign
          </AppText>
        </Button>
      </View>

      <AppText className="mt-6 text-base font-semibold text-foreground">
        Who owes what
      </AppText>

      {participants.length === 0 ? (
        <View className="mt-3 rounded-2xl border border-stone-200/30 bg-background px-4 py-8 dark:border-neutral-800/45">
          <AppText className="text-center text-sm text-muted">
            No participants on this bill yet.
          </AppText>
        </View>
      ) : (
        <View className="mt-3 overflow-hidden rounded-2xl border border-stone-200/30 bg-background dark:border-neutral-800/45">
          {participants.map((participant, index) => (
            <View key={participant.id}>
              {index > 0 ? (
                <View className="mx-4 h-px bg-stone-200/30 dark:bg-neutral-700/35" />
              ) : null}
              <ParticipantRow
                participant={participant}
                index={index}
                onToggleSettled={onToggleSettled}
              />
            </View>
          ))}
        </View>
      )}

      <AdjustmentsSection adjustments={summary.receipt_adjustments} />
    </>
  );
}

export default function BillSummaryFromApiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const billId = parseBillId(id);

  const { data, isLoading, isError, error, refetch } = useBillSummary(billId);
  const { refreshing: pullRefreshing, onRefresh: onPullRefresh } =
    usePullToRefresh(refetch);
  const { toggleParticipantSettled } = useBillParticipants(billId);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (!summaryError) {
      return;
    }

    const timeout = setTimeout(() => setSummaryError(null), 4000);
    return () => clearTimeout(timeout);
  }, [summaryError]);

  const showSummaryError = useCallback((saveError: unknown) => {
    const message = isApiError(saveError)
      ? saveError.message
      : "Could not update payment status. Please try again.";
    setSummaryError(message);
  }, []);

  const handleToggleSettled = useCallback(
    (participant: BillSummaryParticipant) => {
      toggleParticipantSettled.mutate(
        {
          participantId: participant.id,
          settled: !participant.settled,
        },
        { onError: showSummaryError },
      );
    },
    [showSummaryError, toggleParticipantSettled],
  );

  const headerTitle = data?.bill.title ?? "Summary";

  if (billId <= 0) {
    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader title="Summary" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-6">
          <AppText className="text-center text-sm text-muted">
            This bill link is invalid.
          </AppText>
          <Button className="mt-6 w-full" onPress={() => router.back()}>
            Go back
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader title={headerTitle} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator accessibilityLabel="Loading bill summary" />
          <AppText className="text-sm text-muted">
            Loading bill summary…
          </AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    const message = isApiError(error)
      ? error.message
      : "Something went wrong loading this bill.";

    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader title={headerTitle} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <AppText className="text-center text-sm text-foreground">
            {message}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading bill summary"
            className="rounded-xl border border-borderSubtle px-4 py-2 active:opacity-70"
            onPress={() => void refetch()}
          >
            <AppText className="text-sm font-medium text-foreground">
              Try again
            </AppText>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (!data) {
    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader title={headerTitle} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-6">
          <AppText className="text-center text-sm text-muted">
            No summary data for this bill.
          </AppText>
          <Button className="mt-6 w-full" onPress={() => router.back()}>
            Go back
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        title={data.bill.title}
        topHint={data.bill.status}
        onBack={() => router.back()}
      />

      <View className="flex-1 bg-stone-50 dark:bg-neutral-950/50">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-2"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={onPullRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {summaryError ? (
            <NoticeBanner
              className="mb-4"
              dismissAccessibilityLabel="Dismiss error"
              icon="alert-circle-outline"
              message={summaryError}
              variant="sky"
              onDismiss={() => setSummaryError(null)}
            />
          ) : null}

          <BillSummaryContent
            summary={data}
            onToggleSettled={handleToggleSettled}
            onViewReceipt={() =>
              router.push({
                pathname: "/scan/review",
                params: { billId: String(billId) },
              })
            }
            onAssignItems={() =>
              router.push({
                pathname: "/scan/assign",
                params: { billId: String(billId) },
              })
            }
          />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

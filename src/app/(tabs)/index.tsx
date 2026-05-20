import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";

import { isApiError } from "@/api/errors";
import { AppText, Button, ScreenContainer } from "@/components";
import { useBills } from "@/hooks";
import { formatMoneyFromCents } from "@/lib/helper";
import type { BillIndexItem } from "@/types/api";

function formatBillDisplayDate(bill: BillIndexItem): string {
  const raw = bill.receipt_date ?? bill.created_at;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatParticipantsCount(count: number): string {
  return count === 1 ? "1 participant" : `${count} participants`;
}

function BillCard({ bill }: { bill: BillIndexItem }) {
  const displayDate = formatBillDisplayDate(bill);

  return (
    <View className="gap-1 rounded-2xl border border-borderSubtle px-4 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <AppText className="min-w-0 flex-1 text-base font-semibold text-foreground">
          {bill.title}
        </AppText>
        <AppText className="text-base font-semibold text-foreground">
          {formatMoneyFromCents(bill.total_cents)}
        </AppText>
      </View>
      <View className="flex-row flex-wrap items-center gap-x-2 gap-y-0.5">
        <AppText className="text-xs capitalize text-muted">
          {bill.status}
        </AppText>
        <AppText className="text-xs text-muted">·</AppText>
        <AppText className="text-xs text-muted">
          {formatParticipantsCount(bill.participants_count)}
        </AppText>
        {displayDate ? (
          <>
            <AppText className="text-xs text-muted">·</AppText>
            <AppText className="text-xs text-muted">{displayDate}</AppText>
          </>
        ) : null}
      </View>
    </View>
  );
}

function BillsListHeader({ onScan }: { onScan: () => void }) {
  return (
    <View className="gap-4 pb-4">
      <View className="gap-1">
        <AppText className="text-2xl font-semibold text-foreground">
          Home
        </AppText>
        <AppText className="text-sm text-muted">Recent bills</AppText>
      </View>
      <Button accessibilityLabel="Scan" onPress={onScan}>
        Scan
      </Button>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useBills();
  const bills = data?.bills ?? [];

  const listHeader = <BillsListHeader onScan={() => router.push("/scan")} />;

  if (isLoading) {
    return (
      <ScreenContainer className="px-6 pt-6">
        {listHeader}
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator accessibilityLabel="Loading bills" />
          <AppText className="text-sm text-muted">Loading bills…</AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    const message = isApiError(error)
      ? error.message
      : "Something went wrong loading bills.";

    return (
      <ScreenContainer className="px-6 pt-6">
        {listHeader}
        <View className="flex-1 items-center justify-center gap-4">
          <AppText className="text-center text-sm text-foreground">
            {message}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading bills"
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

  return (
    <ScreenContainer className="px-6 pt-6">
      <FlatList
        data={bills}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <BillCard bill={item} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-4 py-16">
            <AppText className="text-center text-sm text-muted">
              No bills yet. Scan a receipt to get started.
            </AppText>
          </View>
        }
        contentContainerStyle={bills.length === 0 ? { flexGrow: 1 } : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

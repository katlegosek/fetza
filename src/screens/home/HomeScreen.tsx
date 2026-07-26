import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isApiError } from "@/api/errors";
import {
  AppText,
  ChatListAvatar,
  ChatListRow,
  GlassIconButton,
  GlassSurface,
  ScreenContainer,
} from "@/components";
import { useAppColorScheme, usePullToRefresh, useThemeColors } from "@/hooks";
import { useBills } from "@/services/bills/bill.hooks";
import type { BillIndexItem } from "@/services/bills/types";
import { formatMoneyFromCents } from "@/utils/money";
import { participantInitials } from "@/utils/participant";

const AVATAR_PALETTE = [
  "#0f766e",
  "#0369a1",
  "#7c3aed",
  "#be123c",
  "#c2410c",
  "#15803d",
] as const;

function avatarColorForTitle(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash + title.charCodeAt(i) * (i + 1)) % AVATAR_PALETTE.length;
  }
  return AVATAR_PALETTE[hash] ?? AVATAR_PALETTE[0];
}

function formatBillListDate(bill: BillIndexItem): string {
  const raw = bill.receipt_date ?? bill.created_at;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfThatDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfThatDay.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff > 1 && dayDiff < 7) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatParticipantsCount(count: number): string {
  return count === 1 ? "1 participant" : `${count} participants`;
}

type BillRowProps = {
  bill: BillIndexItem;
  onPress: () => void;
  showDivider: boolean;
};

/** WhatsApp chat-row style: avatar · title/preview · trailing meta. */
const BillRow = ({ bill, onPress, showDivider }: BillRowProps) => {
  const displayDate = formatBillListDate(bill);
  const preview = `${bill.status} · ${formatParticipantsCount(bill.participants_count)}`;

  return (
    <ChatListRow
      accessibilityLabel={`Open bill ${bill.title}`}
      leading={
        <ChatListAvatar
          backgroundColor={avatarColorForTitle(bill.title)}
          label={participantInitials(bill.title)}
          size="lg"
        />
      }
      preview={
        <AppText
          className="text-[15px] capitalize text-muted"
          numberOfLines={1}
        >
          {preview}
        </AppText>
      }
      showDivider={showDivider}
      size="lg"
      title={bill.title}
      trailingBottom={formatMoneyFromCents(bill.total_cents)}
      trailingTop={displayDate || undefined}
      onPress={onPress}
    />
  );
};

type HomeHeaderProps = {
  search: string;
  onChangeSearch: (value: string) => void;
  onScan: () => void;
  onSettings: () => void;
};

const HomeHeader = ({
  search,
  onChangeSearch,
  onScan,
  onSettings,
}: HomeHeaderProps) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const scheme = useAppColorScheme();
  const glassTint = scheme === "dark" ? "dark" : "light";

  return (
    <View style={{ paddingTop: insets.top + 4 }}>
      {/* Compact action row (WhatsApp: ⋯ left, scan right) — both liquid glass. */}
      <View className="flex-row items-center justify-between px-4 pb-2">
        <GlassIconButton
          accessibilityLabel="More options"
          icon="ellipsis-horizontal"
          iconColor={colors.foreground}
          iconSize={20}
          intensity={scheme === "dark" ? 24 : 18}
          size={40}
          surfaceClassName="border-borderSubtle"
          tint={glassTint}
          onPress={onSettings}
        />

        <GlassIconButton
          accessibilityLabel="Scan receipt"
          icon="camera"
          iconColor="#ffffff"
          iconSize={20}
          intensity={scheme === "dark" ? 28 : 22}
          size={40}
          surfaceClassName="border-emerald-500/35"
          tint={glassTint}
          tintColor="rgba(22, 163, 74, 0.72)"
          highlightColor="rgba(255,255,255,0.45)"
          onPress={onScan}
        />
      </View>

      <View className="px-4 pb-3 pt-1">
        <AppText className="text-[34px] font-bold tracking-tight text-foreground">
          Bills
        </AppText>
      </View>

      <View className="px-4 pb-3">
        <GlassSurface
          blurIntensity={scheme === "dark" ? 28 : 36}
          blurTint={glassTint}
          className="flex-row items-center gap-2 rounded-xl px-3 py-2.5"
          fallbackClassName="border border-borderSubtle bg-black/[0.06] dark:bg-white/10"
          glassEffectStyle="regular"
        >
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            accessibilityLabel="Search bills"
            className="min-w-0 flex-1 text-[16px] text-foreground"
            placeholder="Search bills"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={onChangeSearch}
          />
          {search.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => onChangeSearch("")}
            >
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </GlassSurface>
      </View>
    </View>
  );
};

export const HomeScreen = () => {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useBills();
  const { refreshing: pullRefreshing, onRefresh: onPullRefresh } =
    usePullToRefresh(refetch);
  const [search, setSearch] = useState("");
  const bills = data?.bills ?? [];

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bills;
    return bills.filter((bill) => bill.title.toLowerCase().includes(query));
  }, [bills, search]);

  const goScan = () => router.push("/scan");
  const goSettings = () => router.push("/settings");

  const header = (
    <HomeHeader
      search={search}
      onChangeSearch={setSearch}
      onScan={goScan}
      onSettings={goSettings}
    />
  );

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1">
        {header}
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
      <ScreenContainer className="flex-1">
        {header}
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <AppText className="text-center text-sm text-foreground">
            {message}
          </AppText>
          <Pressable
            accessibilityLabel="Retry loading bills"
            accessibilityRole="button"
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
    <ScreenContainer className="flex-1">
      <FlatList
        data={filteredBills}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <BillRow
            bill={item}
            showDivider={index < filteredBills.length - 1}
            onPress={() =>
              router.push({
                pathname: "/bill/[id]",
                params: { id: String(item.id) },
              })
            }
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View className="items-center px-8 py-16">
            <AppText className="text-center text-lg font-semibold text-foreground">
              {search.trim() ? "No matching bills" : "No bills yet"}
            </AppText>
            <AppText className="mt-2 text-center text-[15px] leading-5 text-muted">
              {search.trim()
                ? "Try a different search."
                : "Tap + to scan a receipt and start splitting."}
            </AppText>
          </View>
        }
        contentContainerStyle={
          filteredBills.length === 0 ? { flexGrow: 1 } : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={onPullRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

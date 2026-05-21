import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  AssignItemSheet,
  AssignLineRow,
  Button,
  ScreenContainer,
  ScreenHeader,
} from "@/components";
import { useThemeColors } from "@/hooks";
import { cn } from "@/lib/cn";
import { formatZAR } from "@/lib/helper";
import {
  avatarTonesForPaletteIndex,
  memberChipBorderToneForIndex,
} from "@/lib/member-avatar-tones";
import {
  loadMemberSettlement,
  saveMemberSettlement,
} from "@/lib/member-settlement-storage";
import { cloneBillDraft } from "@/mocks/draft-bill.helpers";
import type { DraftBill } from "@/mocks/review-draft.mock";
import {
  type AssignmentMap,
  memberLineShares,
  owedCentsByMember,
} from "@/screens/summary/summary.helpers";

type ShareMember = { id: string; name: string };

type SharePayload = {
  draft: DraftBill;
  assignments: AssignmentMap;
  members: ShareMember[];
};

function asSingleParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function possessiveBase(name: string): string {
  const t = name.trim();
  if (t.length === 0) return "Someone's";
  return `${t}'s`;
}

function isYouMember(m: ShareMember): boolean {
  return m.id === "m-you" || m.name.trim().toLowerCase() === "you";
}

function formatPaidOnDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatPaidOnTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function firstName(name: string): string {
  const t = name.trim().split(/\s+/).filter(Boolean);
  return t[0] ?? name;
}

export default function MemberShareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{
    data?: string | string[];
    memberId?: string | string[];
  }>();

  const [settled, setSettled] = useState(false);
  const [paidAt, setPaidAt] = useState<Date | null>(null);
  const [sheetLineId, setSheetLineId] = useState<string | null>(null);

  const payload = useMemo((): SharePayload | null => {
    const raw = asSingleParam(params.data);
    if (!raw || raw.length === 0) return null;
    try {
      const p = JSON.parse(raw) as SharePayload;
      if (
        !p?.draft?.lines ||
        p.assignments == null ||
        !Array.isArray(p.members)
      ) {
        return null;
      }
      return {
        draft: cloneBillDraft(p.draft),
        assignments: { ...p.assignments },
        members: p.members.map((m) => ({ ...m })),
      };
    } catch {
      return null;
    }
  }, [params.data]);

  const memberId = asSingleParam(params.memberId);

  const billId = payload?.draft.billId;

  useEffect(() => {
    if (!billId || !memberId) return;
    let cancelled = false;
    void loadMemberSettlement(billId, memberId).then((row) => {
      if (cancelled) return;
      if (!row) {
        setSettled(false);
        setPaidAt(null);
        return;
      }
      setSettled(row.settled);
      setPaidAt(row.paidAtIso ? new Date(row.paidAtIso) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [billId, memberId]);

  const model = useMemo(() => {
    if (!payload || !memberId) return null;
    const { draft, assignments, members } = payload;
    const member = members.find((m) => m.id === memberId);
    if (!member) return null;
    const memberIds = members.map((m) => m.id);
    const owed = owedCentsByMember(draft, assignments, memberIds);
    const lines = memberLineShares(draft, assignments, memberId);
    const assignedLineCount = lines.length;
    const toneIdx = Math.max(
      0,
      members.findIndex((m) => m.id === memberId),
    );
    const avatarTones = avatarTonesForPaletteIndex(toneIdx);

    return {
      draft,
      assignments,
      billMembers: members,
      member,
      owedCents: owed[memberId] ?? 0,
      lines,
      assignedLineCount,
      avatarTones,
    };
  }, [payload, memberId]);

  const sheetMembers = useMemo(() => {
    if (!model) return [];
    return model.billMembers.map((m, i) => ({
      id: m.id,
      name: m.name,
      tone: memberChipBorderToneForIndex(i),
      ...avatarTonesForPaletteIndex(i),
    }));
  }, [model]);

  const headerTitle = model
    ? isYouMember(model.member)
      ? "Your share"
      : `${possessiveBase(model.member.name)} share`
    : "Share";

  const shareSubtitle = headerTitle;

  const itemsSectionUpper = model
    ? isYouMember(model.member)
      ? "YOU"
      : model.member.name.toUpperCase()
    : "";

  const onOverflow = useCallback(() => {
    Alert.alert(
      "Options",
      undefined,
      [
        { text: "Share breakdown", onPress: () => {} },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    );
  }, []);

  const togglePaid = useCallback(async () => {
    if (!billId || !memberId) return;
    if (settled) {
      await saveMemberSettlement(billId, memberId, false, null);
      setSettled(false);
      setPaidAt(null);
      return;
    }
    const d = new Date();
    await saveMemberSettlement(billId, memberId, true, d.toISOString());
    setSettled(true);
    setPaidAt(d);
  }, [billId, memberId, settled]);

  if (!model) {
    return (
      <ScreenContainer className="flex-1">
        <ScreenHeader title="Share" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center bg-stone-50 px-6 dark:bg-neutral-950/50">
          <AppText className="text-center text-base leading-6 text-muted">
            We could not open this person's share. Go back and try again.
          </AppText>
          <Button className="mt-6 w-full" onPress={() => router.back()}>
            Go back
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  const {
    draft,
    assignments,
    member,
    owedCents,
    lines,
    assignedLineCount,
    avatarTones,
  } = model;
  const merchantHint =
    draft.merchant.trim().length > 0 ? draft.merchant.trim() : undefined;
  const fn = firstName(member.name);
  const sendLabel = isYouMember(member)
    ? "Send your share"
    : `Send ${fn} their share`;

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        rightSlot={
          <Pressable
            accessibilityLabel="More options"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-borderSubtle bg-white active:opacity-85 dark:bg-background"
            hitSlop={8}
            onPress={onOverflow}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={colors.foreground}
            />
          </Pressable>
        }
        title={headerTitle}
        topHint={merchantHint}
        onBack={() => router.back()}
      />

      <View className="flex-1 bg-stone-50 dark:bg-neutral-950/50">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-4 pt-2"
          contentContainerStyle={{
            paddingBottom: 24 + insets.bottom + 88,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="overflow-hidden rounded-2xl border border-stone-200/30 bg-white p-4 shadow-sm shadow-stone-900/5 dark:border-neutral-800/45 dark:bg-neutral-900 dark:shadow-none">
            <View className="flex-row gap-3">
              <View
                className="size-[4.5rem] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: avatarTones.avatarBackgroundColor }}
              >
                <AppText
                  className="text-xl font-bold"
                  style={{ color: avatarTones.avatarTextColor }}
                >
                  {initials(member.name)}
                </AppText>
              </View>
              <View className="min-w-0 flex-1 justify-center">
                <AppText className="text-xs text-muted">
                  {shareSubtitle}
                </AppText>
                <AppText className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
                  {formatZAR(owedCents)}
                </AppText>
                <AppText className="mt-0.5 text-xs text-muted">
                  {assignedLineCount}{" "}
                  {assignedLineCount === 1 ? "item" : "items"}
                </AppText>
              </View>
              <View className="shrink-0 items-end self-start pt-0.5">
                {settled ? (
                  <>
                    <View className="flex-row items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 dark:bg-emerald-950/80">
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#059669"
                      />
                      <AppText className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                        Paid
                      </AppText>
                    </View>
                    {paidAt ? (
                      <View className="mt-1 items-end">
                        <AppText className="text-right text-[10px] leading-snug text-muted">
                          Paid on {formatPaidOnDate(paidAt)}
                        </AppText>
                        <AppText className="text-right text-[10px] leading-snug text-muted">
                          {formatPaidOnTime(paidAt)}
                        </AppText>
                      </View>
                    ) : null}
                  </>
                ) : (
                  <View className="min-w-[7.75rem] flex-row items-center justify-center gap-1 rounded-full bg-red-100 px-3 py-1 dark:bg-red-950/80">
                    <Ionicons name="alert-circle" size={14} color="#dc2626" />
                    <AppText className="text-[10px] font-bold uppercase tracking-wide text-red-800 dark:text-red-300">
                      Outstanding
                    </AppText>
                  </View>
                )}
              </View>
            </View>

            <Button
              className="mt-4 w-full px-6 py-3.5"
              onPress={() => void togglePaid()}
            >
              {settled ? "Mark as unpaid" : "Mark as paid"}
            </Button>
          </View>

          <AppText className="mb-2 mt-6 text-[10px] font-bold tracking-wider text-muted">
            Items assigned to {itemsSectionUpper}
          </AppText>

          {lines.length === 0 ? (
            <View className="mx-1.5 rounded-2xl border border-stone-200/30 bg-white py-10 dark:border-neutral-800/45 dark:bg-neutral-900">
              <AppText className="text-center text-sm text-muted">
                No items assigned yet.
              </AppText>
            </View>
          ) : (
            <View className="mx-1.5 gap-0">
              {lines.map((ls, index) => {
                const line = draft.lines.find((l) => l.id === ls.lineId);
                if (!line) return null;
                return (
                  <View
                    key={ls.lineId}
                    className={cn(
                      "overflow-hidden rounded-2xl border border-stone-200/30 bg-white shadow-sm shadow-stone-900/5 dark:border-neutral-800/45 dark:bg-neutral-900 dark:shadow-none",
                      index > 0 && "-mt-px",
                    )}
                  >
                    <AssignLineRow
                      assigneeCount={ls.assigneeCount}
                      index={index}
                      line={line}
                      lineHint="View who shared this item"
                      shareCents={ls.shareCents}
                      variant="share"
                      onPress={() => setSheetLineId(line.id)}
                    />
                  </View>
                );
              })}
              <View
                className={cn(
                  "overflow-hidden rounded-2xl border border-stone-200/30 bg-white shadow-sm shadow-stone-900/5 dark:border-neutral-800/45 dark:bg-neutral-900 dark:shadow-none",
                  "-mt-px",
                )}
              >
                <View className="flex-row items-center justify-between px-3 py-3.5">
                  <AppText className="text-base font-bold text-foreground">
                    Total
                  </AppText>
                  <AppText className="text-base font-bold tabular-nums text-foreground">
                    {formatZAR(owedCents)}
                  </AppText>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View
          pointerEvents="box-none"
          className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-0"
          style={{
            backgroundColor: "transparent",
            paddingBottom: insets.bottom,
          }}
        >
          <Pressable
            accessibilityLabel={sendLabel}
            accessibilityRole="button"
            className="flex-row items-center rounded-2xl bg-foreground px-5 py-4 shadow-lg shadow-black/25 active:opacity-90 dark:shadow-black/50"
            onPress={() =>
              Alert.alert(
                "Send share",
                `"${sendLabel}" will use your device share sheet in a future update.`,
              )
            }
          >
            <AppText className="flex-1 pr-3 text-center text-lg font-semibold text-background">
              {sendLabel}
            </AppText>
            <Ionicons name="send" size={20} color={colors.background} />
          </Pressable>
        </View>
      </View>

      <AssignItemSheet
        key={sheetLineId ?? "_"}
        bottomInset={insets.bottom}
        initialSelectedIds={
          sheetLineId ? [...(assignments[sheetLineId] ?? [])].sort() : []
        }
        line={
          sheetLineId
            ? (draft.lines.find((l) => l.id === sheetLineId) ?? null)
            : null
        }
        members={sheetMembers}
        readOnly
        visible={sheetLineId !== null}
        onClose={() => setSheetLineId(null)}
        onSave={() => {}}
      />
    </ScreenContainer>
  );
}

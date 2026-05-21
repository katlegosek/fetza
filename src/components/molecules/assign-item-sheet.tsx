import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "@/components/atoms";
import { Button } from "@/components/molecules/button";
import { SheetCloseButton } from "@/components/organisms/bottom-sheet/sheet-close-button";
import { useThemeColors } from "@/hooks";
import { cn } from "@/lib/cn";
import { formatZAR } from "@/lib/helper";
import type { ReceiptLine } from "@/types/draft-bill";

export type AssignItemSheetMember = {
  id: string;
  name: string;
  tone: string;
  avatarBackgroundColor: string;
  avatarTextColor: string;
};

export type AssignItemSheetProps = {
  visible: boolean;
  line: ReceiptLine | null;
  members: AssignItemSheetMember[];
  /** Current assignees for this line when the sheet opens. */
  initialSelectedIds: string[];
  bottomInset?: number;
  formatAmount?: (cents: number) => string;
  onClose: () => void;
  /** Persist chosen members for this line (may be empty). Ignored when `readOnly`. */
  onSave: (memberIds: string[]) => void;
  /** View-only: same layout except no split method and chips are not interactive. */
  readOnly?: boolean;
};

const OFF_Y = 620;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function AssignItemSheet({
  visible,
  line,
  members,
  initialSelectedIds,
  bottomInset = 0,
  formatAmount: formatAmountProp,
  onClose,
  onSave,
  readOnly = false,
}: AssignItemSheetProps) {
  const formatAmount = formatAmountProp ?? formatZAR;
  const colors = useThemeColors();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const initialIdsRef = useRef(initialSelectedIds);
  initialIdsRef.current = initialSelectedIds;

  const [localIds, setLocalIds] = useState<string[]>(() => [
    ...initialSelectedIds,
  ]);
  /** Off by default; when on, everyone is selected (undo restores prior selection). */
  const [equalAllSelected, setEqualAllSelected] = useState(false);
  /** Which split card the user picked; `null` = neither highlighted. */
  const [splitFocus, setSplitFocus] = useState<null | "equal" | "custom">(null);
  const idsBeforeEqualRef = useRef<string[]>([]);

  const translateY = useSharedValue(OFF_Y);
  const backdrop = useSharedValue(0);

  const openSheet = useCallback(() => {
    translateY.value = OFF_Y;
    backdrop.value = 0;
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    backdrop.value = withTiming(1, { duration: 220 });
  }, [backdrop, translateY]);

  const selectionSignature = [...initialSelectedIds].sort().join("\0");

  // biome-ignore lint/correctness/useExhaustiveDependencies: selectionSignature tracks assignee ids for this line so chips sync when saved assignments change.
  useEffect(() => {
    if (!visible || !line?.id) return;
    setLocalIds([...initialIdsRef.current]);
    setEqualAllSelected(false);
    setSplitFocus(null);
    idsBeforeEqualRef.current = [];
    openSheet();
  }, [visible, line?.id, openSheet, selectionSignature]);

  const beginClose = useCallback(() => {
    backdrop.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(
      OFF_Y,
      { duration: 260, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onCloseRef.current)();
      },
    );
  }, [backdrop, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  const toggleMember = (id: string) => {
    setLocalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /** Leaving “everyone” via the chips turns off equal mode. */
  useEffect(() => {
    if (members.length === 0 || !equalAllSelected) return;
    const allIds = members.map((m) => m.id);
    const sel = new Set(localIds);
    const everyone =
      allIds.length > 0 &&
      allIds.length === sel.size &&
      allIds.every((id) => sel.has(id));
    if (!everyone) {
      setEqualAllSelected(false);
      setSplitFocus((prev) => (prev === "equal" ? null : prev));
    }
  }, [localIds, members, equalAllSelected]);

  const onEqualSplitPress = () => {
    if (!equalAllSelected) {
      idsBeforeEqualRef.current = [...localIds];
      setLocalIds(members.map((m) => m.id));
      setEqualAllSelected(true);
      setSplitFocus("equal");
      return;
    }
    setLocalIds([...idsBeforeEqualRef.current]);
    setEqualAllSelected(false);
    setSplitFocus(null);
  };

  const onCustomSplitPress = () => {
    if (equalAllSelected) {
      setLocalIds([...idsBeforeEqualRef.current]);
      setEqualAllSelected(false);
    }
    setSplitFocus("custom");
  };

  const perPersonCents = useMemo(() => {
    if (!line || localIds.length === 0) return 0;
    return Math.round(line.amountCents / localIds.length);
  }, [line, localIds.length]);

  const qtyLabel =
    line && line.qty > 1
      ? `${line.qty}× ${line.description}`
      : line?.description;

  const eachPaysAmount =
    localIds.length === 0 ? "—" : formatAmount(perPersonCents);

  const equalCardActive = equalAllSelected;
  const customCardActive = splitFocus === "custom" && !equalAllSelected;

  const assignedMembersOrdered = useMemo(() => {
    const byId = new Map(members.map((m) => [m.id, m] as const));
    const orderedIds = [...initialSelectedIds].sort();
    return orderedIds
      .filter((id) => byId.has(id))
      .map((id) => byId.get(id) as AssignItemSheetMember);
  }, [initialSelectedIds, members]);

  if (!line) return null;

  return (
    <Modal
      animationType="none"
      onRequestClose={beginClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          className="absolute inset-0 bg-black/45"
          style={backdropStyle}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            className="flex-1"
            onPress={beginClose}
          />
        </Animated.View>

        <Animated.View
          className="rounded-t-3xl px-5 pt-3"
          style={[
            {
              backgroundColor: colors.background,
              paddingBottom: bottomInset + 24,
              maxHeight: "92%",
            },
            sheetStyle,
          ]}
        >
          <View className="relative mb-1">
            <View className="mb-3 h-[5px] w-12 self-center rounded-full bg-borderSubtle" />
            <View className="absolute -top-1 right-0">
              <SheetCloseButton
                accessibilityLabel={readOnly ? "Close" : "Close Assignment"}
                onPress={beginClose}
              />
            </View>
          </View>

          <AppText className="text-xl font-bold text-foreground">
            Assign Item
          </AppText>
          <AppText className="mt-2 text-base font-semibold text-foreground">
            {qtyLabel ?? ""}
          </AppText>
          <AppText className="mt-0.5 text-base tabular-nums text-muted">
            {formatAmount(line.amountCents)}
          </AppText>

          <AppText className="mt-4 text-[15px] font-semibold text-foreground">
            Who had this?
          </AppText>
          <AppText className="mt-0.5 text-sm text-muted">
            {readOnly
              ? "People assigned to this line"
              : "Select one or more people"}
          </AppText>

          <ScrollView
            horizontal
            className="mt-3 -mx-1"
            contentContainerClassName="flex-row gap-2 px-1 py-1"
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            {readOnly ? (
              assignedMembersOrdered.length === 0 ? (
                <AppText className="py-2 text-sm text-muted">
                  No one assigned.
                </AppText>
              ) : (
                assignedMembersOrdered.map((m) => {
                  return (
                    <View
                      key={m.id}
                      className={cn(
                        "relative flex-row items-center gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2.5",
                        m.tone.split(" ").slice(1).join(" "),
                      )}
                    >
                      <View
                        className="absolute -right-0.5 -top-0.5 z-10 size-[18px] items-center justify-center rounded-full"
                        pointerEvents="none"
                        style={{ backgroundColor: m.avatarBackgroundColor }}
                      >
                        <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                      </View>
                      <View
                        className="size-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: m.avatarBackgroundColor }}
                      >
                        <AppText
                          className="text-[11px] font-bold"
                          style={{ color: m.avatarTextColor }}
                        >
                          {initials(m.name)}
                        </AppText>
                      </View>
                      <AppText
                        className="max-w-[96px] text-xs font-medium text-foreground"
                        numberOfLines={1}
                      >
                        {m.name}
                      </AppText>
                    </View>
                  );
                })
              )
            ) : (
              members.map((m) => {
                const selected = localIds.includes(m.id);
                const borderTone = m.tone.split(" ").slice(1).join(" ");
                return (
                  <Pressable
                    key={m.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={cn(
                      "relative flex-row items-center gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2.5 active:opacity-85",
                      selected
                        ? borderTone
                        : "border-borderSubtle bg-background",
                    )}
                    onPress={() => toggleMember(m.id)}
                  >
                    {selected ? (
                      <View
                        className="absolute -right-0.5 -top-0.5 z-10 size-[18px] items-center justify-center rounded-full"
                        pointerEvents="none"
                        style={{ backgroundColor: m.avatarBackgroundColor }}
                      >
                        <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                      </View>
                    ) : null}
                    <View
                      className="size-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: m.avatarBackgroundColor }}
                    >
                      <AppText
                        className="text-[11px] font-bold"
                        style={{ color: m.avatarTextColor }}
                      >
                        {initials(m.name)}
                      </AppText>
                    </View>
                    <AppText
                      className={cn(
                        "max-w-[96px] text-xs font-medium",
                        selected ? "text-foreground" : "text-muted-foreground",
                      )}
                      numberOfLines={1}
                    >
                      {m.name}
                    </AppText>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View className="mt-3 flex-row items-center gap-1.5">
            <Ionicons name="people-outline" size={18} color={colors.muted} />
            <AppText className="text-sm text-muted">
              {readOnly
                ? `${assignedMembersOrdered.length} ${assignedMembersOrdered.length === 1 ? "person" : "people"} on this line`
                : `${localIds.length} ${localIds.length === 1 ? "person" : "people"} selected`}
            </AppText>
          </View>

          {readOnly ? null : (
            <>
              <View className="my-4 h-px bg-borderSubtle" />

              <AppText className="text-lg font-bold text-foreground">
                Split method
              </AppText>
              <AppText className="mt-1 text-sm text-muted">
                How should this item be split?
              </AppText>

              <View className="mt-4 flex-row gap-2.5">
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: equalCardActive }}
                  accessibilityLabel={
                    equalAllSelected
                      ? "Undo assign everyone"
                      : "Assign everyone and split equally"
                  }
                  className={cn(
                    "min-h-[104px] flex-1 rounded-2xl border p-3.5 active:opacity-95",
                    equalCardActive
                      ? "border-foreground bg-white dark:bg-neutral-950"
                      : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950",
                  )}
                  onPress={onEqualSplitPress}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="size-9 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <Ionicons
                        name="people-outline"
                        size={18}
                        color={colors.muted}
                      />
                    </View>
                    {equalCardActive ? (
                      <View className="size-[22px] items-center justify-center rounded-full bg-foreground">
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={colors.background}
                        />
                      </View>
                    ) : (
                      <View className="size-[22px] rounded-full border border-neutral-300 dark:border-neutral-500" />
                    )}
                  </View>
                  <AppText className="mt-3 text-[15px] font-bold text-foreground">
                    Equal split
                  </AppText>
                  <AppText className="mt-1 text-xs leading-snug text-muted">
                    Split equally between selected people
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: customCardActive }}
                  accessibilityHint="Custom amounts are not available yet"
                  className={cn(
                    "min-h-[104px] flex-1 rounded-2xl border p-3.5 active:opacity-95",
                    customCardActive
                      ? "border-foreground bg-white dark:bg-neutral-950"
                      : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950",
                  )}
                  onPress={onCustomSplitPress}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="size-9 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <Ionicons
                        name="calculator-outline"
                        size={18}
                        color={colors.muted}
                      />
                    </View>
                    {customCardActive ? (
                      <View className="size-[22px] items-center justify-center rounded-full bg-foreground">
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={colors.background}
                        />
                      </View>
                    ) : (
                      <View className="size-[22px] rounded-full border border-neutral-300 dark:border-neutral-500" />
                    )}
                  </View>
                  <AppText className="mt-3 text-[15px] font-bold text-foreground">
                    Custom amount
                  </AppText>
                  <AppText className="mt-1 text-xs leading-snug text-muted">
                    Set different amounts for each person
                  </AppText>
                </Pressable>
              </View>
            </>
          )}

          {readOnly ? <View className="my-4 h-px bg-borderSubtle" /> : null}

          <View className="mt-4 w-full flex-row items-center gap-2.5 rounded-2xl bg-neutral-200/60 px-3.5 py-2.5 dark:bg-neutral-800/85">
            <View className="shrink-0">
              <Ionicons
                name="pie-chart-outline"
                size={18}
                color={colors.muted}
              />
            </View>
            <AppText
              className="min-w-0 flex-1 text-sm text-muted"
              numberOfLines={1}
            >
              Each person pays:
            </AppText>
            <AppText
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                localIds.length === 0
                  ? "text-muted"
                  : "text-violet-600 dark:text-violet-400",
              )}
            >
              {eachPaysAmount}
            </AppText>
          </View>

          <Button
            accessibilityLabel={readOnly ? "Done" : "Save Assignment"}
            className="mt-4 w-full rounded-2xl py-3.5"
            onPress={() => {
              if (readOnly) {
                beginClose();
                return;
              }
              onSave(localIds);
              beginClose();
            }}
          >
            <AppText className="text-center text-base font-semibold text-background">
              {readOnly ? "Done" : "Save Assignment"}
            </AppText>
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
}

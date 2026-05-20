import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms";
import { useThemeColors } from "@/hooks";
import { cn } from "@/lib/cn";
import { formatZAR } from "@/lib/helper";
import type { ReceiptLine } from "@/mocks/review-draft.mock";

type AssignLineLike = Pick<ReceiptLine, "qty" | "description" | "amountCents">;

export type AssignLineRowMember = {
  id: string;
  name: string;
  tone: string;
  avatarBackgroundColor: string;
  avatarTextColor: string;
};

export type AssignLineRowProps =
  | {
      variant: "assign";
      line: AssignLineLike;
      assigned: AssignLineRowMember[];
      lineHint: string;
      unassignedLabel?: string;
      formatAmount?: (cents: number) => string;
      onPress: () => void;
      index: number;
    }
  | {
      variant: "share";
      line: AssignLineLike;
      shareCents: number;
      assigneeCount: number;
      lineHint: string;
      formatAmount?: (cents: number) => string;
      onPress: () => void;
      index: number;
    };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function lineListIcon(
  line: AssignLineLike,
  index: number,
): keyof typeof Ionicons.glyphMap {
  const d = line.description.toLowerCase();
  if (/\b(wine|chenin|glass|drink|blanc)\b/.test(d)) return "wine-outline";
  if (/\b(coffee|water|sparkling)\b/.test(d)) return "cafe-outline";
  if (/\b(bread|sourdough|butter)\b/.test(d)) return "nutrition-outline";
  if (
    /\b(bao|pork|sticky|halloumi|broccolini|fondant|chocolate|charred)\b/.test(
      d,
    )
  ) {
    return "restaurant-outline";
  }
  const pool = [
    "restaurant-outline",
    "nutrition-outline",
    "wine-outline",
    "leaf-outline",
  ] as const satisfies readonly (keyof typeof Ionicons.glyphMap)[];
  return pool[index % pool.length];
}

export function AssignLineRow(props: AssignLineRowProps) {
  const colors = useThemeColors();
  const { line, lineHint, onPress, index } = props;
  const formatAmount = props.formatAmount ?? formatZAR;
  const qtyLabel = line.qty > 1 ? `${line.qty}x ` : "";
  const listIcon = lineListIcon(line, index);

  if (props.variant === "share") {
    const { shareCents, assigneeCount } = props;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityHint={lineHint}
        className="flex-row items-stretch gap-2 px-3 py-3 active:bg-stone-50 dark:active:bg-neutral-800/60"
        onPress={onPress}
      >
        <View className="shrink-0 justify-center">
          <View className="size-10 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
            <Ionicons name={listIcon} size={20} color="#7c3aed" />
          </View>
        </View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <AppText
              className="min-w-0 flex-1 text-base font-bold text-foreground"
              numberOfLines={2}
            >
              {qtyLabel}
              {line.description}
            </AppText>
            <AppText className="shrink-0 text-base font-semibold tabular-nums text-foreground">
              {formatAmount(shareCents)}
            </AppText>
          </View>
          <AppText
            className="mt-1.5 text-sm font-medium tabular-nums text-muted"
            numberOfLines={2}
          >
            Split {assigneeCount} {assigneeCount === 1 ? "way" : "ways"} ·{" "}
            {formatAmount(line.amountCents)} total
          </AppText>
        </View>

        <View className="shrink-0 self-stretch justify-center pl-0.5">
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </View>
      </Pressable>
    );
  }

  const { assigned, unassignedLabel = "Tap to assign" } = props;
  const n = assigned.length;
  const perPersonCents = n >= 2 ? Math.round(line.amountCents / n) : 0;
  const assignedLabel =
    n === 1
      ? `Assigned to ${assigned[0]?.name ?? ""}`
      : n >= 2
        ? `Split ${n} ways · ${formatAmount(perPersonCents)} each`
        : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={lineHint}
      className="flex-row items-stretch gap-2 px-3 py-3 active:bg-stone-50 dark:active:bg-neutral-800/60"
      onPress={onPress}
    >
      <View className="shrink-0 justify-center">
        <View className="size-10 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
          <Ionicons name={listIcon} size={20} color="#7c3aed" />
        </View>
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <AppText
            className="min-w-0 flex-1 text-base font-bold text-foreground"
            numberOfLines={2}
          >
            {qtyLabel}
            {line.description}
          </AppText>
          <AppText className="shrink-0 text-base font-medium tabular-nums text-foreground">
            {formatAmount(line.amountCents)}
          </AppText>
        </View>

        <View className="mt-1.5 flex-row items-center justify-between gap-2">
          {n === 0 ? (
            <View
              key="unassigned"
              className="self-start rounded-full bg-orange-100 px-2.5 py-1 dark:bg-orange-950/50"
            >
              <AppText className="text-[13px] font-semibold text-orange-900 dark:text-orange-200">
                • {unassignedLabel}
              </AppText>
            </View>
          ) : (
            <View
              key={`assigned-${assigned.map((member) => member.id).join("-")}`}
              className="min-w-0 flex-1 flex-row items-center justify-between gap-2"
            >
              <View className="shrink-0 flex-row items-center gap-1">
                {assigned.map((m) => (
                  <View
                    key={m.id}
                    className="size-7 items-center justify-center rounded-full"
                    style={{ backgroundColor: m.avatarBackgroundColor }}
                  >
                    <AppText
                      className="text-[11px] font-bold"
                      style={{ color: m.avatarTextColor }}
                    >
                      {initials(m.name)}
                    </AppText>
                  </View>
                ))}
              </View>
              <AppText
                className="min-w-0 flex-1 text-right text-sm font-medium tabular-nums text-muted"
                numberOfLines={2}
                style={{ textAlign: "right" }}
              >
                {assignedLabel}
              </AppText>
            </View>
          )}
        </View>
      </View>

      <View className="shrink-0 self-stretch justify-center pl-0.5">
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </View>
    </Pressable>
  );
}

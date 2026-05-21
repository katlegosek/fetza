import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AnimatedZarAmount, AppText } from "@/components";
import { useThemeColors } from "@/hooks";

export type SummaryTotalsCardProps = {
  outstandingCents: number;
  unpaidCount: number;
  tipCents: number;
  tipPercentLabel: string;
};

export const SummaryTotalsCard = ({
  outstandingCents,
  unpaidCount,
  tipCents,
  tipPercentLabel,
}: SummaryTotalsCardProps) => {
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityHint="Bill totals and tip"
      accessibilityRole="button"
      className="flex-row items-stretch overflow-hidden rounded-2xl border border-stone-200/40 bg-white shadow-md shadow-stone-900/8 active:bg-stone-50 dark:border-neutral-800/50 dark:bg-neutral-900 dark:shadow-none dark:active:bg-neutral-800/50"
      onPress={() => {}}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-3 py-4 pl-4 pr-2">
        <View className="size-10 shrink-0 items-center justify-center rounded-full bg-[#B8E8D0] dark:bg-emerald-800/55">
          <Ionicons name="bookmark-outline" size={20} color="#ffffff" />
        </View>
        <View className="min-w-0 flex-1">
          <AppText className="text-[12px] font-medium text-muted">
            Outstanding
          </AppText>
          <AnimatedZarAmount
            cents={outstandingCents}
            style={{
              marginTop: 2,
              fontSize: 20,
              fontWeight: "700",
              fontVariant: ["tabular-nums"],
              color: colors.foreground,
            }}
          />
          <AppText className="mt-0.5 text-[12px] leading-snug text-muted">
            {unpaidCount} unpaid
          </AppText>
        </View>
      </View>

      <View className="w-px self-stretch bg-stone-200/70 dark:bg-neutral-600/50" />

      <View className="min-w-0 flex-1 flex-row items-center gap-2 py-4 pl-3 pr-3">
        <View className="relative size-10 shrink-0 items-center justify-center rounded-full bg-[#FFD4A8] dark:bg-orange-900/45">
          <View className="absolute" style={{ left: 9, top: 11 }}>
            <Ionicons name="heart" size={12} color="#ffffff" />
          </View>
          <View className="absolute" style={{ left: 15, top: 9 }}>
            <Ionicons name="heart" size={12} color="#ffffff" />
          </View>
        </View>
        <View className="min-w-0 flex-1">
          <AppText className="text-[12px] font-medium text-muted">Tip</AppText>
          <AnimatedZarAmount
            cents={tipCents}
            style={{
              marginTop: 2,
              fontSize: 20,
              fontWeight: "700",
              fontVariant: ["tabular-nums"],
              color: colors.foreground,
            }}
          />
          <AppText
            className="mt-0.5 text-[12px] leading-snug text-muted"
            numberOfLines={2}
          >
            {tipPercentLabel}
          </AppText>
        </View>
        <View className="shrink-0 justify-center pl-0.5">
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>
      </View>
    </Pressable>
  );
};

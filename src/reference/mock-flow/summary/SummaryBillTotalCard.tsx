import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { AnimatedZarAmount, AppText } from "@/components";
import { useThemeColors } from "@/hooks";
import { cn } from "@/lib/cn";
import { formatZAR } from "@/lib/helper";

export type SummaryBillTotalCardProps = {
  grandTotalCents: number;
  lineCount: number;
  chevronColor: string;
  className?: string;
  onOpenReceipt: () => void;
};

export const SummaryBillTotalCard = ({
  grandTotalCents,
  lineCount,
  chevronColor,
  className,
  onOpenReceipt,
}: SummaryBillTotalCardProps) => {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityLabel={`Bill total ${formatZAR(grandTotalCents)}, ${lineCount} items. Details`}
      accessibilityRole="button"
      className={cn(
        "flex-row items-center gap-3 rounded-2xl border border-violet-200/70 bg-violet-50 p-4 shadow-sm shadow-violet-950/5 active:opacity-90 dark:border-violet-900/45 dark:bg-violet-950/40 dark:shadow-none",
        className,
      )}
      hitSlop={4}
      onPress={onOpenReceipt}
    >
      <View className="size-11 shrink-0 items-center justify-center rounded-full bg-violet-200/90 dark:bg-violet-500/25">
        <Ionicons name="document-text-outline" size={22} color="#7c3aed" />
      </View>
      <View className="min-w-0 flex-1">
        <AppText className="text-base font-bold text-foreground">
          Bill total
        </AppText>
        <AppText className="mt-0.5 text-sm text-muted">
          {lineCount} {lineCount === 1 ? "item" : "items"}
        </AppText>
      </View>
      <View className="shrink-0 flex-row items-center gap-0.5 pl-1">
        <AnimatedZarAmount
          cents={grandTotalCents}
          style={{
            fontSize: 16,
            fontWeight: "700",
            fontVariant: ["tabular-nums"],
            color: colors.foreground,
          }}
        />
        <Ionicons name="chevron-forward" size={18} color={chevronColor} />
      </View>
    </Pressable>
  );
};

import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { AnimatedZarAmount, AppText, Button } from "@/components";
import { cn } from "@/lib/cn";

export type AssignBottomBarProps = {
  bottomInset: number;
  assignedItemsTotalCents: number;
  itemCountLabel: string;
  allLinesAssigned: boolean;
  isApiMode: boolean;
  foregroundColor: string;
  backgroundColor: string;
  mutedColor: string;
  onSummaryPress: () => void;
};

export const AssignBottomBar = ({
  bottomInset,
  assignedItemsTotalCents,
  itemCountLabel,
  allLinesAssigned,
  isApiMode,
  foregroundColor,
  backgroundColor,
  mutedColor,
  onSummaryPress,
}: AssignBottomBarProps) => {
  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-0"
      style={{
        backgroundColor: "transparent",
        paddingBottom: bottomInset,
      }}
    >
      <View className="flex-row items-stretch gap-2 rounded-2xl border border-borderSubtle bg-background px-3 py-3 shadow-lg shadow-black/20">
        <View className="min-w-0 flex-1 basis-0 flex-row items-center pr-1.5">
          <View className="size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
            <Ionicons name="document-text-outline" size={22} color="#7c3aed" />
          </View>
          <View className="min-w-0 justify-center pl-2">
            <AppText className="text-[11px] leading-tight text-muted">
              Assigned total
            </AppText>
            <AnimatedZarAmount
              cents={assignedItemsTotalCents}
              style={{
                marginTop: 2,
                fontSize: 20,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
                color: foregroundColor,
                lineHeight: 24,
              }}
            />
            <AppText className="mt-0.5 text-[11px] leading-tight text-muted">
              {itemCountLabel}
            </AppText>
          </View>
        </View>

        <View className="min-w-0 flex-1 basis-0 self-stretch pl-1.5">
          <Button
            accessibilityLabel={
              isApiMode ? "View bill summary" : "View Summary"
            }
            className="h-full w-full min-w-0 self-stretch flex-row items-center justify-center gap-1 rounded-xl px-3 py-0"
            disabled={!allLinesAssigned}
            onPress={onSummaryPress}
          >
            <AppText
              className={cn(
                "text-base font-semibold",
                allLinesAssigned
                  ? "text-background"
                  : "text-neutral-600 dark:text-neutral-300",
              )}
            >
              {isApiMode ? "View summary" : "View Summary"}
            </AppText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={allLinesAssigned ? backgroundColor : mutedColor}
            />
          </Button>
        </View>
      </View>
    </View>
  );
};

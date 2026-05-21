import { Pressable, View } from "react-native";

import { AppText, ScreenHeader } from "@/components";
import { cn } from "@/lib/cn";
import type { SummaryViewMode } from "@/screens/summary/summary.constants";

export type TableListToggleProps = {
  value: SummaryViewMode;
  onChange: (v: SummaryViewMode) => void;
};

export const TableListToggle = ({ value, onChange }: TableListToggleProps) => {
  return (
    <View className="flex-row rounded-full border border-borderSubtle bg-stone-100/90 p-0.5 dark:border-neutral-700 dark:bg-neutral-900">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === "table" }}
        className={cn(
          "rounded-full px-2.5 py-1.5 active:opacity-90",
          value === "table" && "bg-foreground",
        )}
        hitSlop={6}
        onPress={() => onChange("table")}
      >
        <AppText
          className={cn(
            "text-center text-[11px] font-bold tracking-wide",
            value === "table" ? "text-background" : "text-foreground",
          )}
        >
          Table
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === "list" }}
        className={cn(
          "rounded-full px-2.5 py-1.5 active:opacity-90",
          value === "list" && "bg-foreground",
        )}
        hitSlop={6}
        onPress={() => onChange("list")}
      >
        <AppText
          className={cn(
            "text-center text-[11px] font-bold tracking-wide",
            value === "list" ? "text-background" : "text-foreground",
          )}
        >
          List
        </AppText>
      </Pressable>
    </View>
  );
};

export type SummaryHeaderProps = {
  merchantHint?: string;
  viewMode: SummaryViewMode;
  onViewModeChange: (mode: SummaryViewMode) => void;
  onBack: () => void;
};

export const SummaryHeader = ({
  merchantHint,
  viewMode,
  onViewModeChange,
  onBack,
}: SummaryHeaderProps) => {
  return (
    <ScreenHeader
      rightSlot={
        <TableListToggle onChange={onViewModeChange} value={viewMode} />
      }
      title="Summary"
      topHint={merchantHint}
      onBack={onBack}
    />
  );
};

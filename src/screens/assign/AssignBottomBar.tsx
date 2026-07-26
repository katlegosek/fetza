import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import {
  AnimatedZarAmount,
  AppText,
  GlassSurface,
  NativeGlassButton,
} from "@/components";
import { useAppColorScheme } from "@/hooks";

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
  // Kept for call-site compatibility (glass CTA no longer needs these colors).
  backgroundColor: _backgroundColor,
  mutedColor: _mutedColor,
  onSummaryPress,
}: AssignBottomBarProps) => {
  const scheme = useAppColorScheme();
  const label = isApiMode ? "View summary" : "View Summary";

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-0"
      style={{
        backgroundColor: "transparent",
        paddingBottom: bottomInset,
      }}
    >
      <GlassSurface
        blurIntensity={scheme === "dark" ? 36 : 48}
        blurTint={scheme === "dark" ? "dark" : "light"}
        className="flex-row items-stretch gap-2 rounded-2xl px-3 py-3"
        fallbackClassName="border border-borderSubtle bg-background/92 shadow-lg shadow-black/20"
        glassEffectStyle="regular"
      >
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

        <View className="min-w-0 flex-1 basis-0 self-stretch justify-center pl-1.5">
          <NativeGlassButton
            accessibilityLabel={label}
            disabled={!allLinesAssigned}
            label={label}
            systemImage="chevron.right"
            variant="glassProminent"
            onPress={onSummaryPress}
          />
        </View>
      </GlassSurface>
    </View>
  );
};

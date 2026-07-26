import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, View } from "react-native";

import { AppText, GlassSurface, NativeGlassButton } from "@/components";
import { useAppColorScheme, useThemeColors } from "@/hooks";

export type ReviewBottomBarProps = {
  bottomInset: number;
  totalDisplay: string;
  itemCountLabel: string;
  onConfirmPress?: () => void;
  /** Kept for the isolated reference flow; active routes use onConfirmPress. */
  onAssignPress?: () => void;
  isConfirming?: boolean;
  disabled?: boolean;
};

export const ReviewBottomBar = ({
  bottomInset,
  totalDisplay,
  itemCountLabel,
  onConfirmPress,
  onAssignPress,
  isConfirming = false,
  disabled = false,
}: ReviewBottomBarProps) => {
  const colors = useThemeColors();
  const scheme = useAppColorScheme();

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
          <View
            className="size-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.borderSubtle }}
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color={colors.foreground}
            />
          </View>
          <View className="min-w-0 justify-center pl-2">
            <AppText className="text-[11px] leading-tight text-muted">
              Total
            </AppText>
            <AppText className="mt-0.5 text-xl font-bold tabular-nums leading-tight text-foreground">
              {totalDisplay}
            </AppText>
            <AppText className="mt-0.5 text-[11px] leading-tight text-muted">
              {itemCountLabel}
            </AppText>
          </View>
        </View>

        <View className="min-w-0 flex-1 basis-0 self-stretch justify-center pl-1.5">
          {isConfirming ? (
            <View className="h-12 items-center justify-center">
              <ActivityIndicator size="small" color={colors.foreground} />
            </View>
          ) : (
            <NativeGlassButton
              accessibilityLabel="Continue"
              disabled={disabled}
              label="Continue"
              systemImage="chevron.right"
              variant="glassProminent"
              onPress={onConfirmPress ?? onAssignPress}
            />
          )}
        </View>
      </GlassSurface>
    </View>
  );
};

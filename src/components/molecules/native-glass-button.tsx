import { Button, Host } from "@expo/ui/swift-ui";
import { Platform, View } from "react-native";

import { AppText } from "@/components/atoms";
import { Button as AppButton } from "@/components/molecules/button";
import { useThemeColors } from "@/hooks";
import { cn } from "@/lib/cn";
import { canUseLiquidGlass } from "@/lib/liquid-glass";

export type NativeGlassButtonProps = {
  label: string;
  accessibilityLabel?: string;
  onPress?: () => void;
  disabled?: boolean;
  /** SF Symbol shown beside the label (iOS native path). */
  systemImage?: string;
  /**
   * `glassProminent` = filled liquid-glass primary CTA (iOS 26+).
   * `glass` = lighter glass control.
   */
  variant?: "glass" | "glassProminent";
  className?: string;
};

/**
 * Primary/secondary CTA that uses SwiftUI `Button` `glass` / `glassProminent`
 * variants on iOS 26 (Xcode 26 builds). Falls back to the JS `Button` elsewhere.
 *
 * @see https://docs.expo.dev/versions/v54.0.0/sdk/ui/swift-ui/
 */
export const NativeGlassButton = ({
  label,
  accessibilityLabel,
  onPress,
  disabled = false,
  systemImage,
  variant = "glassProminent",
  className,
}: NativeGlassButtonProps) => {
  const colors = useThemeColors();
  const prominent = variant === "glassProminent";

  if (Platform.OS !== "ios" || !canUseLiquidGlass()) {
    return (
      <AppButton
        accessibilityLabel={accessibilityLabel ?? label}
        className={cn(
          "h-12 w-full min-w-0 self-stretch flex-row items-center justify-center gap-1 rounded-xl px-3 py-0 shadow-sm shadow-black/15",
          !prominent && "border border-borderSubtle bg-background",
          className,
        )}
        disabled={disabled}
        onPress={onPress}
      >
        <AppText
          className={cn(
            "text-base font-semibold",
            disabled
              ? "text-neutral-600 dark:text-neutral-300"
              : prominent
                ? "text-background"
                : "text-foreground",
          )}
        >
          {label}
        </AppText>
      </AppButton>
    );
  }

  return (
    <View className={cn("h-12 self-stretch", className)}>
      <Host style={{ flex: 1, justifyContent: "center" }}>
        <Button
          color={prominent ? colors.foreground : undefined}
          controlSize="large"
          disabled={disabled}
          systemImage={systemImage as never}
          variant={variant}
          onPress={onPress}
        >
          {label}
        </Button>
      </Host>
    </View>
  );
};

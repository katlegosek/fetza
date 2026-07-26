import { Button, Host } from "@expo/ui/swift-ui";
import { Platform, View } from "react-native";

import { AppText } from "@/components/atoms";
import { Button as AppButton } from "@/components/molecules/button";
import { cn } from "@/lib/cn";

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
  if (Platform.OS !== "ios") {
    return (
      <AppButton
        accessibilityLabel={accessibilityLabel ?? label}
        className={cn(
          "h-full w-full min-w-0 self-stretch flex-row items-center justify-center gap-1 rounded-xl px-3 py-0",
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
              : "text-background",
          )}
        >
          {label}
        </AppText>
      </AppButton>
    );
  }

  return (
    <View className={cn("min-h-[48px] flex-1 self-stretch", className)}>
      <Host style={{ flex: 1, justifyContent: "center" }}>
        <Button
          color={variant === "glassProminent" ? "#0a0a0a" : undefined}
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

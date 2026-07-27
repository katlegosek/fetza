import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Modal, Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms";
import { GlassIconButton } from "@/components/molecules/glass-icon-button";
import {
  NativeOverflowMenuButton,
  type NativeOverflowMenuItem,
  canUseNativeGlassMenu,
} from "@/components/molecules/native-overflow-menu-button";
import { useThemeColors } from "@/hooks";

export type PlatformOverflowMenuItem = NativeOverflowMenuItem & {
  /** Ionicon used only by the Material/frosted fallback menu. */
  fallbackIcon: ComponentProps<typeof Ionicons>["name"];
};

export type PlatformOverflowMenuButtonProps = {
  accessibilityLabel: string;
  items: PlatformOverflowMenuItem[];
  onPressAction: (actionId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iconColor: string;
  tint: "light" | "dark" | "default";
  intensity: number;
  /** Offset below the safe-area top for the anchored fallback menu. */
  fallbackTopOffset?: number;
  fallbackMaxWidth?: number;
};

/**
 * One overflow-menu implementation for all screens.
 *
 * iOS 26+ uses the SwiftUI glass menu trigger and native morph. Older iOS,
 * Android, and unsupported runtimes use a platform-neutral anchored menu with
 * the shared frosted/Material icon control.
 */
export const PlatformOverflowMenuButton = ({
  accessibilityLabel,
  items,
  onPressAction,
  open,
  onOpenChange,
  iconColor,
  tint,
  intensity,
  fallbackTopOffset = 60,
  fallbackMaxWidth = 268,
}: PlatformOverflowMenuButtonProps) => {
  if (canUseNativeGlassMenu()) {
    return (
      <NativeOverflowMenuButton
        accessibilityLabel={accessibilityLabel}
        items={items}
        onPressAction={onPressAction}
      />
    );
  }

  return (
    <FallbackOverflowMenuButton
      accessibilityLabel={accessibilityLabel}
      fallbackMaxWidth={fallbackMaxWidth}
      fallbackTopOffset={fallbackTopOffset}
      iconColor={iconColor}
      intensity={intensity}
      items={items}
      open={open}
      tint={tint}
      onOpenChange={onOpenChange}
      onPressAction={onPressAction}
    />
  );
};

const FallbackOverflowMenuButton = ({
  accessibilityLabel,
  items,
  onPressAction,
  open,
  onOpenChange,
  iconColor,
  tint,
  intensity,
  fallbackTopOffset,
  fallbackMaxWidth,
}: PlatformOverflowMenuButtonProps) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const menuWidth = Math.min(fallbackMaxWidth ?? 268, windowWidth - 32);
  const top = insets.top + (fallbackTopOffset ?? 60);

  const select = (actionId: string) => {
    onOpenChange(false);
    onPressAction(actionId);
  };

  return (
    <>
      <GlassIconButton
        accessibilityLabel={accessibilityLabel}
        icon="ellipsis-horizontal"
        iconColor={iconColor}
        iconSize={22}
        intensity={intensity}
        size={40}
        surfaceClassName="border-borderSubtle"
        tint={tint}
        onPress={() => onOpenChange(true)}
      />

      <Modal
        animationType="fade"
        hardwareAccelerated
        onRequestClose={() => onOpenChange(false)}
        presentationStyle="overFullScreen"
        statusBarTranslucent
        transparent
        visible={open}
      >
        <View
          accessibilityViewIsModal
          className="flex-1"
          importantForAccessibility="yes"
        >
          <Pressable
            accessibilityLabel="Close menu"
            accessibilityRole="button"
            className="absolute inset-0"
            onPress={() => onOpenChange(false)}
          />
          <View
            className="absolute right-4 overflow-hidden rounded-2xl border border-borderSubtle bg-background shadow-lg shadow-black/20"
            style={{
              elevation: 8,
              top,
              width: menuWidth,
            }}
          >
            {items.map((item) => (
              <View key={item.id}>
                {item.dividerBefore ? (
                  <View
                    className="mx-3 h-px"
                    style={{ backgroundColor: colors.borderSubtle }}
                  />
                ) : null}
                <FallbackMenuRow
                  destructive={item.destructive}
                  icon={item.fallbackIcon}
                  label={item.title}
                  onPress={() => select(item.id)}
                />
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};

const FallbackMenuRow = ({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) => {
  const colors = useThemeColors();
  const foreground = destructive ? "#dc2626" : colors.foreground;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      android_ripple={{ color: "rgba(127,127,127,0.14)" }}
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-black/5 dark:active:bg-white/10"
      onPress={onPress}
    >
      <View className="w-[22px] shrink-0 items-center">
        <Ionicons name={icon} size={22} color={foreground} />
      </View>
      <AppText
        className="min-w-0 flex-1 pr-1 text-[17px] font-semibold leading-snug"
        numberOfLines={3}
        style={{ color: foreground }}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

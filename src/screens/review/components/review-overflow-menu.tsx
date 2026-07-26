import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Modal, Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  GlassIconButton,
  NativeOverflowMenuButton,
  type NativeOverflowMenuItem,
  canUseNativeGlassMenu,
} from "@/components";
import { useThemeColors } from "@/hooks";

export type ReviewOverflowMenuProps = {
  iconColor: string;
  /** Fallback blur tint for older iOS / Android. */
  tint: "light" | "dark" | "default";
  intensity: number;
  onViewOriginal: () => void;
  onHelp: () => void;
  onRescan: () => void;
  onClearReceipt: () => void;
};

type ActionId = "view_original" | "help" | "rescan" | "clear";

const USE_NATIVE_GLASS_MENU = canUseNativeGlassMenu();

const MENU_ITEMS: NativeOverflowMenuItem[] = [
  {
    id: "view_original",
    title: "View original receipt",
    systemImage: "photo",
  },
  { id: "help", title: "Help", systemImage: "questionmark.circle" },
  { id: "rescan", title: "Rescan receipt", systemImage: "arrow.clockwise" },
  {
    id: "clear",
    title: "Clear receipt",
    systemImage: "trash",
    destructive: true,
    dividerBefore: true,
  },
];

/**
 * "More options". On iOS uses Expo SwiftUI `Menu` + `buttonStyle('glass')` so
 * the system morphs the glass trigger into the menu (WhatsApp / Apple path).
 * Android keeps a JS modal fallback.
 */
export const ReviewOverflowMenu = (props: ReviewOverflowMenuProps) =>
  USE_NATIVE_GLASS_MENU ? (
    <NativeReviewOverflowMenu {...props} />
  ) : (
    <FallbackReviewOverflowMenu {...props} />
  );

const NativeReviewOverflowMenu = ({
  onViewOriginal,
  onHelp,
  onRescan,
  onClearReceipt,
}: ReviewOverflowMenuProps) => {
  const handlers: Record<ActionId, () => void> = {
    view_original: onViewOriginal,
    help: onHelp,
    rescan: onRescan,
    clear: onClearReceipt,
  };

  return (
    <NativeOverflowMenuButton
      accessibilityLabel="More options"
      items={MENU_ITEMS}
      onPressAction={(actionId) => handlers[actionId as ActionId]?.()}
    />
  );
};

const FallbackRow = ({
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
  const fg = destructive ? "#dc2626" : colors.foreground;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-black/5 dark:active:bg-white/10"
      onPress={onPress}
    >
      <View className="w-[22px] shrink-0 items-center">
        <Ionicons name={icon} size={22} color={fg} />
      </View>
      <View className="min-w-0 flex-1 justify-center pr-1">
        <AppText
          className="text-[17px] font-semibold leading-snug"
          numberOfLines={3}
          style={{ color: fg }}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
};

const FallbackReviewOverflowMenu = ({
  iconColor,
  tint,
  intensity,
  onViewOriginal,
  onHelp,
  onRescan,
  onClearReceipt,
}: ReviewOverflowMenuProps) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const menuWidth = Math.min(248, windowWidth - 32);
  const top = insets.top + 60;

  const wrap = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <GlassIconButton
        accessibilityLabel="More options"
        icon="ellipsis-horizontal"
        iconColor={iconColor}
        iconSize={22}
        intensity={intensity}
        size={40}
        surfaceClassName="border-borderSubtle"
        tint={tint}
        onPress={() => setOpen(true)}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
        transparent
        visible={open}
      >
        <View className="flex-1">
          <Pressable
            accessibilityLabel="Close menu"
            accessibilityRole="button"
            className="absolute inset-0"
            onPress={() => setOpen(false)}
          />
          <View
            className="absolute right-4 overflow-hidden rounded-2xl border border-borderSubtle bg-background shadow-lg shadow-black/20"
            style={{ top, width: menuWidth }}
          >
            <FallbackRow
              icon="image-outline"
              label="View original receipt"
              onPress={wrap(onViewOriginal)}
            />
            <FallbackRow
              icon="help-circle-outline"
              label="Help"
              onPress={wrap(onHelp)}
            />
            <FallbackRow
              icon="refresh-outline"
              label="Rescan receipt"
              onPress={wrap(onRescan)}
            />
            <View
              className="mx-3 h-px"
              style={{ backgroundColor: colors.borderSubtle }}
            />
            <FallbackRow
              destructive
              icon="trash-outline"
              label="Clear receipt"
              onPress={wrap(onClearReceipt)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Modal, Pressable, View, useWindowDimensions } from "react-native";

import { AppText } from "@/components/atoms";
import { useThemeColors } from "@/hooks";

export type ReviewOverflowMenuProps = {
  visible: boolean;
  /** Distance from top of screen to top edge of the menu card (e.g. below header). */
  top: number;
  onClose: () => void;
  onViewOriginal: () => void;
  onHelp: () => void;
  onRescan: () => void;
  onClearReceipt: () => void;
};

const Row = ({
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

export const ReviewOverflowMenu = ({
  visible,
  top,
  onClose,
  onViewOriginal,
  onHelp,
  onRescan,
  onClearReceipt,
}: ReviewOverflowMenuProps) => {
  const colors = useThemeColors();
  const { width: windowWidth } = useWindowDimensions();
  /** Fits longest row without excess horizontal padding. */
  const menuWidth = Math.min(248, windowWidth - 32);

  const wrap = (fn: () => void) => () => {
    onClose();
    fn();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          className="absolute inset-0"
          onPress={onClose}
        />
        <View
          className="absolute right-4 overflow-hidden rounded-2xl border border-borderSubtle bg-background shadow-lg shadow-black/20"
          style={{ top, width: menuWidth }}
        >
          <Row
            icon="image-outline"
            label="View original receipt"
            onPress={wrap(onViewOriginal)}
          />
          <Row icon="help-circle-outline" label="Help" onPress={wrap(onHelp)} />
          <Row
            icon="refresh-outline"
            label="Rescan receipt"
            onPress={wrap(onRescan)}
          />

          <View
            className="mx-3 h-px"
            style={{ backgroundColor: colors.borderSubtle }}
          />

          <Row
            destructive
            icon="trash-outline"
            label="Clear receipt"
            onPress={wrap(onClearReceipt)}
          />
        </View>
      </View>
    </Modal>
  );
};

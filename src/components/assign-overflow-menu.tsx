import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Modal, Pressable, View, useWindowDimensions } from "react-native";

import { AppText } from "@/components/atoms";
import { useThemeColors } from "@/hooks";

export type AssignOverflowMenuProps = {
  visible: boolean;
  top: number;
  onClose: () => void;
  onUndoSplitEqually?: () => void;
  showUndoSplitEqually?: boolean;
  onSplitAllEqually: () => void;
  onSplitUnassignedItems: () => void;
  onManagePeople: () => void;
  onClearAssignments: () => void;
};

function Row({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
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
}

export function AssignOverflowMenu({
  visible,
  top,
  onClose,
  onUndoSplitEqually,
  showUndoSplitEqually,
  onSplitAllEqually,
  onSplitUnassignedItems,
  onManagePeople,
  onClearAssignments,
}: AssignOverflowMenuProps) {
  const colors = useThemeColors();
  const { width: windowWidth } = useWindowDimensions();
  const menuWidth = Math.min(268, windowWidth - 32);

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
          {showUndoSplitEqually && onUndoSplitEqually ? (
            <Row
              icon="arrow-undo-outline"
              label="Undo split equally"
              onPress={wrap(onUndoSplitEqually)}
            />
          ) : null}

          <Row
            icon="people-outline"
            label="Split equally"
            onPress={wrap(onSplitAllEqually)}
          />
          <Row
            icon="person-add-outline"
            label="Split unassigned items"
            onPress={wrap(onSplitUnassignedItems)}
          />
          <Row
            icon="settings-outline"
            label="Manage people"
            onPress={wrap(onManagePeople)}
          />

          <View
            className="mx-3 h-px"
            style={{ backgroundColor: colors.borderSubtle }}
          />

          <Row
            destructive
            icon="trash-outline"
            label="Clear assignments"
            onPress={wrap(onClearAssignments)}
          />
        </View>
      </View>
    </Modal>
  );
}

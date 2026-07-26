import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
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

export type AssignOverflowMenuProps = {
  iconColor: string;
  /** Fallback blur tint for older iOS / Android. */
  tint: "light" | "dark" | "default";
  intensity: number;
  onUndoSplitEqually?: () => void;
  showUndoSplitEqually?: boolean;
  onSplitAllEqually: () => void;
  onSplitUnassignedItems: () => void;
  onManagePeople: () => void;
  onClearAssignments: () => void;
};

type ActionId =
  | "undo_split"
  | "split_equally"
  | "split_unassigned"
  | "manage_people"
  | "clear";

const USE_NATIVE_GLASS_MENU = canUseNativeGlassMenu();

/**
 * Assign-screen "More options". iOS: Expo SwiftUI glass Menu (system morph).
 * Android: JS modal fallback.
 */
export const AssignOverflowMenu = (props: AssignOverflowMenuProps) =>
  USE_NATIVE_GLASS_MENU ? (
    <NativeAssignOverflowMenu {...props} />
  ) : (
    <FallbackAssignOverflowMenu {...props} />
  );

const NativeAssignOverflowMenu = ({
  onUndoSplitEqually,
  showUndoSplitEqually,
  onSplitAllEqually,
  onSplitUnassignedItems,
  onManagePeople,
  onClearAssignments,
}: AssignOverflowMenuProps) => {
  const items = useMemo((): NativeOverflowMenuItem[] => {
    const rows: NativeOverflowMenuItem[] = [];
    if (showUndoSplitEqually && onUndoSplitEqually) {
      rows.push({
        id: "undo_split",
        title: "Undo split equally",
        systemImage: "arrow.uturn.backward",
      });
    }
    rows.push(
      {
        id: "split_equally",
        title: "Split equally",
        systemImage: "person.3",
      },
      {
        id: "split_unassigned",
        title: "Split unassigned items",
        systemImage: "person.badge.plus",
      },
      {
        id: "manage_people",
        title: "Manage people",
        systemImage: "gearshape",
      },
      {
        id: "clear",
        title: "Clear assignments",
        systemImage: "trash",
        destructive: true,
        dividerBefore: true,
      },
    );
    return rows;
  }, [onUndoSplitEqually, showUndoSplitEqually]);

  const handlers: Record<ActionId, (() => void) | undefined> = {
    undo_split: onUndoSplitEqually,
    split_equally: onSplitAllEqually,
    split_unassigned: onSplitUnassignedItems,
    manage_people: onManagePeople,
    clear: onClearAssignments,
  };

  return (
    <NativeOverflowMenuButton
      accessibilityLabel="More options"
      items={items}
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

const FallbackAssignOverflowMenu = ({
  iconColor,
  tint,
  intensity,
  onUndoSplitEqually,
  showUndoSplitEqually,
  onSplitAllEqually,
  onSplitUnassignedItems,
  onManagePeople,
  onClearAssignments,
}: AssignOverflowMenuProps) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const menuWidth = Math.min(268, windowWidth - 32);
  const top = insets.top + 84;

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
            {showUndoSplitEqually && onUndoSplitEqually ? (
              <FallbackRow
                icon="arrow-undo-outline"
                label="Undo split equally"
                onPress={wrap(onUndoSplitEqually)}
              />
            ) : null}
            <FallbackRow
              icon="people-outline"
              label="Split equally"
              onPress={wrap(onSplitAllEqually)}
            />
            <FallbackRow
              icon="person-add-outline"
              label="Split unassigned items"
              onPress={wrap(onSplitUnassignedItems)}
            />
            <FallbackRow
              icon="settings-outline"
              label="Manage people"
              onPress={wrap(onManagePeople)}
            />
            <View
              className="mx-3 h-px"
              style={{ backgroundColor: colors.borderSubtle }}
            />
            <FallbackRow
              destructive
              icon="trash-outline"
              label="Clear assignments"
              onPress={wrap(onClearAssignments)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

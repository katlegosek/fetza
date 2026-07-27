import { useMemo, useState } from "react";

import {
  PlatformOverflowMenuButton,
  type PlatformOverflowMenuItem,
} from "@/components";

export type AssignOverflowMenuProps = {
  iconColor: string;
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

export const AssignOverflowMenu = ({
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
  const [open, setOpen] = useState(false);
  const items = useMemo((): PlatformOverflowMenuItem[] => {
    const rows: PlatformOverflowMenuItem[] = [];
    if (showUndoSplitEqually && onUndoSplitEqually) {
      rows.push({
        id: "undo_split",
        title: "Undo split equally",
        systemImage: "arrow.uturn.backward",
        fallbackIcon: "arrow-undo-outline",
      });
    }
    rows.push(
      {
        id: "split_equally",
        title: "Split equally",
        systemImage: "person.3",
        fallbackIcon: "people-outline",
      },
      {
        id: "split_unassigned",
        title: "Split unassigned items",
        systemImage: "person.badge.plus",
        fallbackIcon: "person-add-outline",
      },
      {
        id: "manage_people",
        title: "Manage people",
        systemImage: "gearshape",
        fallbackIcon: "settings-outline",
      },
      {
        id: "clear",
        title: "Clear assignments",
        systemImage: "trash",
        fallbackIcon: "trash-outline",
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
    <PlatformOverflowMenuButton
      accessibilityLabel="More options"
      fallbackTopOffset={84}
      iconColor={iconColor}
      intensity={intensity}
      items={items}
      open={open}
      tint={tint}
      onOpenChange={setOpen}
      onPressAction={(actionId) => handlers[actionId as ActionId]?.()}
    />
  );
};

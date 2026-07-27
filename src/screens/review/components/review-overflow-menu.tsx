import { useState } from "react";

import {
  PlatformOverflowMenuButton,
  type PlatformOverflowMenuItem,
} from "@/components";

export type ReviewOverflowMenuProps = {
  iconColor: string;
  tint: "light" | "dark" | "default";
  intensity: number;
  onViewOriginal: () => void;
  onHelp: () => void;
  onRescan: () => void;
  onClearReceipt: () => void;
};

type ActionId = "view_original" | "help" | "rescan" | "clear";

const MENU_ITEMS: PlatformOverflowMenuItem[] = [
  {
    id: "view_original",
    title: "View original receipt",
    systemImage: "photo",
    fallbackIcon: "image-outline",
  },
  {
    id: "help",
    title: "Help",
    systemImage: "questionmark.circle",
    fallbackIcon: "help-circle-outline",
  },
  {
    id: "rescan",
    title: "Rescan receipt",
    systemImage: "arrow.clockwise",
    fallbackIcon: "refresh-outline",
  },
  {
    id: "clear",
    title: "Clear receipt",
    systemImage: "trash",
    fallbackIcon: "trash-outline",
    destructive: true,
    dividerBefore: true,
  },
];

export const ReviewOverflowMenu = ({
  iconColor,
  tint,
  intensity,
  onViewOriginal,
  onHelp,
  onRescan,
  onClearReceipt,
}: ReviewOverflowMenuProps) => {
  const [open, setOpen] = useState(false);
  const handlers: Record<ActionId, () => void> = {
    view_original: onViewOriginal,
    help: onHelp,
    rescan: onRescan,
    clear: onClearReceipt,
  };

  return (
    <PlatformOverflowMenuButton
      accessibilityLabel="More options"
      fallbackMaxWidth={248}
      fallbackTopOffset={60}
      iconColor={iconColor}
      intensity={intensity}
      items={MENU_ITEMS}
      open={open}
      tint={tint}
      onOpenChange={setOpen}
      onPressAction={(actionId) => handlers[actionId as ActionId]?.()}
    />
  );
};

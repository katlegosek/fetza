import { Button, ContextMenu, Divider, Host, Image } from "@expo/ui/swift-ui";
import {
  accessibilityLabel as a11yLabel,
  buttonStyle,
  clipShape,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import { Platform } from "react-native";

import { canUseLiquidGlass } from "@/lib/liquid-glass";

/** Match the circular header chrome (back button size). */
const TRIGGER_SIZE = 40;

export type NativeOverflowMenuItem = {
  id: string;
  title: string;
  /** SF Symbol name shown in the native menu row. */
  systemImage?: string;
  destructive?: boolean;
  /** Insert a divider before this item. */
  dividerBefore?: boolean;
};

export type NativeOverflowMenuButtonProps = {
  accessibilityLabel: string;
  items: NativeOverflowMenuItem[];
  onPressAction: (actionId: string) => void;
};

/**
 * True when we can render Expo's SwiftUI menu (the path that gets Apple's
 * Liquid Glass morph: glass button → menu). Android stays on the JS fallback.
 */
export const canUseNativeGlassMenu = (): boolean =>
  Platform.OS === "ios" && canUseLiquidGlass();

/**
 * WhatsApp / system-style overflow control.
 *
 * Uses `@expo/ui` SwiftUI `ContextMenu` (single-press → `SwiftUI.Menu`) with
 * `buttonStyle('glass')` — Apple's API for "glass button morphs into the menu".
 * Do not wrap the trigger in `GlassView` / `glassEffect()`; that fights the morph.
 *
 * Pinned to `@expo/ui@0.2.0-beta.9` for Expo SDK 54 compatibility.
 */
export const NativeOverflowMenuButton = ({
  accessibilityLabel,
  items,
  onPressAction,
}: NativeOverflowMenuButtonProps) => {
  if (!canUseNativeGlassMenu()) {
    return null;
  }

  return (
    <Host matchContents>
      <ContextMenu
        activationMethod="singlePress"
        modifiers={[
          buttonStyle("glass"),
          // Glass menus default to a capsule around the content; lock a square
          // frame + circle clip so the trigger matches the round back button.
          frame({ width: TRIGGER_SIZE, height: TRIGGER_SIZE }),
          clipShape("circle"),
        ]}
      >
        <ContextMenu.Trigger>
          <Image
            // Horizontal ellipsis — same glyph WhatsApp uses for "more".
            systemName="ellipsis"
            size={17}
            color="#0a0a0a"
            modifiers={[
              a11yLabel(accessibilityLabel),
              frame({ width: TRIGGER_SIZE, height: TRIGGER_SIZE }),
            ]}
          />
        </ContextMenu.Trigger>
        <ContextMenu.Items>
          {items.map((item) => (
            <NativeMenuRow
              key={item.id}
              item={item}
              onPress={() => onPressAction(item.id)}
            />
          ))}
        </ContextMenu.Items>
      </ContextMenu>
    </Host>
  );
};

const NativeMenuRow = ({
  item,
  onPress,
}: {
  item: NativeOverflowMenuItem;
  onPress: () => void;
}) => (
  <>
    {item.dividerBefore ? <Divider /> : null}
    <Button
      role={item.destructive ? "destructive" : "default"}
      systemImage={item.systemImage as never}
      onPress={onPress}
    >
      {item.title}
    </Button>
  </>
);

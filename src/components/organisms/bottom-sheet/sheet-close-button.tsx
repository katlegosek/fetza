import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";

import { useThemeColors } from "@/hooks";

export type SheetCloseButtonProps = {
  onPress: () => void;
  /** Default `Close`. */
  accessibilityLabel?: string;
};

/** Circular muted close control — shared by bottom sheets and modals. */
export const SheetCloseButton = ({
  onPress,
  accessibilityLabel = "Close",
}: SheetCloseButtonProps) => {
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="size-9 items-center justify-center rounded-full active:opacity-70"
      hitSlop={10}
      style={{ backgroundColor: colors.borderSubtle }}
      onPress={onPress}
    >
      <Ionicons name="close" size={22} color={colors.foreground} />
    </Pressable>
  );
};

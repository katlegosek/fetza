import { GlassIconButton } from "@/components/molecules";
import { useAppColorScheme, useThemeColors } from "@/hooks";

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
  const scheme = useAppColorScheme();

  return (
    <GlassIconButton
      accessibilityLabel={accessibilityLabel}
      icon="close"
      iconColor={colors.foreground}
      iconSize={20}
      intensity={scheme === "dark" ? 24 : 18}
      materialElevation={0}
      size={36}
      surfaceClassName="border-borderSubtle"
      tint={scheme === "dark" ? "dark" : "light"}
      onPress={onPress}
    />
  );
};

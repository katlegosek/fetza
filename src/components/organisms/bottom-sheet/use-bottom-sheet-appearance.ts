import { useAppColorScheme, useThemeColors } from "@/hooks";

import type { BottomSheetAppearance } from "./types";

/**
 * Theme-driven colors for `BottomSheet` chrome and fields that use `bottomSheetFormClasses`.
 * This is **not** open/close state — use `useBottomSheetVisibility` from `@/hooks` for that.
 */
export function useBottomSheetAppearance(): BottomSheetAppearance {
  const colors = useThemeColors();
  const scheme = useAppColorScheme();
  const fieldBg =
    scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  return {
    sheetBg: colors.background,
    ink: colors.foreground,
    muted: colors.muted,
    border: colors.borderSubtle,
    fieldBg,
    handle: colors.borderSubtle,
    onPrimary: colors.background,
  };
}

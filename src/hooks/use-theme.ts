import { useColorScheme } from "react-native";

import { cn } from "@/lib/cn";
import {
  type ColorSchemeName,
  type ThemeColors,
  getColors,
} from "@/theme/colors";

/** OS preference with a stable default when `useColorScheme()` is `null` / `undefined`. */
export const useAppColorScheme = (): ColorSchemeName =>
  useColorScheme() === "dark" ? "dark" : "light";

/** Hex palette for the current scheme — use when React Navigation `Theme` does not carry the token (e.g. `muted`). */
export const useThemeColors = (): ThemeColors => getColors(useAppColorScheme());

export type RootLayoutAppearance = Readonly<{
  scheme: ColorSchemeName;
  rootClassName: string;
}>;

/**
 * For `app/_layout.tsx`: ties React Navigation `ThemeProvider` to NativeWind (`dark` class + surface).
 */
export const useRootLayoutAppearance = (): RootLayoutAppearance => {
  const scheme = useAppColorScheme();
  const rootClassName = cn("flex-1 bg-canvas", scheme === "dark" && "dark");
  return { scheme, rootClassName };
};

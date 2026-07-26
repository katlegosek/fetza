import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

import { type ColorSchemeName, colorSchemes } from "@/theme/colors";

function navigationTheme(scheme: ColorSchemeName): Theme {
  const base = scheme === "light" ? DefaultTheme : DarkTheme;
  const { canvas, foreground } = colorSchemes[scheme];

  return {
    ...base,
    colors: {
      ...base.colors,
      background: canvas,
      text: foreground,
    },
  };
}

/** Navigation chrome — hex per scheme from `colors.json` (Tailwind uses CSS vars). */
export const NAV_THEME: Record<ColorSchemeName, Theme> = {
  light: navigationTheme("light"),
  dark: navigationTheme("dark"),
};

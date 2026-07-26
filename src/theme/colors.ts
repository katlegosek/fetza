import themeColorsJson from "./colors.json";

/** One appearance — keys stay stable; only values change per scheme in `colors.json`. */
export type ThemeColors = Readonly<{
  /** Elevated surface (cards, bars, sheets). iOS `secondarySystemGroupedBackground`. */
  background: string;
  /** Page background behind surfaces. iOS `systemGroupedBackground`. */
  canvas: string;
  foreground: string;
  muted: string;
  borderSubtle: string;
}>;

export type ColorSchemeName = "light" | "dark";

export type ThemeColorSchemes = Readonly<Record<ColorSchemeName, ThemeColors>>;

export const colorSchemes: ThemeColorSchemes = themeColorsJson;

export const getColors = (scheme: ColorSchemeName): ThemeColors =>
  colorSchemes[scheme];

export type ThemeColorKey = keyof ThemeColors;

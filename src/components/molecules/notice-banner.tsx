import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import {
  Pressable,
  type StyleProp,
  type TextStyle,
  View,
  type ViewProps,
} from "react-native";

import { AppText } from "@/components/atoms";
import { useAppColorScheme } from "@/hooks";
import { cn } from "@/lib/cn";

/** Matches `memberAssignHighlight` sky row: tinted surface + `text-*-800` / `dark:text-*-200`. */
const PRESETS = {
  sky: {
    surfaceClassName:
      "border border-sky-200/80 bg-sky-500/15 shadow-sm shadow-sky-900/5 dark:border-sky-500/30 dark:bg-sky-500/25 dark:shadow-none",
    textClassName: "text-sky-800 dark:text-sky-200",
    iconHex: { light: "#0284c7", dark: "#38bdf8" },
  },
  violet: {
    surfaceClassName:
      "border border-violet-200/80 bg-violet-500/15 shadow-sm shadow-violet-900/5 dark:border-violet-500/30 dark:bg-violet-500/25 dark:shadow-none",
    textClassName: "text-violet-800 dark:text-violet-200",
    iconHex: { light: "#7c3aed", dark: "#a78bfa" },
  },
} as const;

export type NoticeBannerVariant = keyof typeof PRESETS;

export type NoticeBannerChrome = {
  surfaceClassName: string;
  textClassName: string;
  iconColor: string;
  surfaceStyle?: ViewProps["style"];
  textStyle?: StyleProp<TextStyle>;
};

export type NoticeBannerProps = ViewProps & {
  icon: ComponentProps<typeof Ionicons>["name"];
  message: string;
  iconSize?: number;
  /** Used when `chrome` is omitted. Default `sky` (same typography as assigning banners). */
  variant?: NoticeBannerVariant;
  /** Overrides `variant` (e.g. per-member tint). */
  chrome?: NoticeBannerChrome;
  onDismiss?: () => void;
  dismissAccessibilityLabel?: string;
};

export const NoticeBanner = ({
  icon,
  message,
  iconSize = 20,
  variant = "sky",
  chrome,
  onDismiss,
  dismissAccessibilityLabel = "Dismiss",
  className,
  style,
  ...rest
}: NoticeBannerProps) => {
  const scheme = useAppColorScheme();
  const preset = PRESETS[variant] ?? PRESETS.sky;
  const iconColor =
    chrome?.iconColor ?? preset.iconHex[scheme === "dark" ? "dark" : "light"];

  return (
    <View
      className={cn(
        "flex-row items-center gap-2 rounded-2xl px-3 py-2.5",
        chrome ? chrome.surfaceClassName : preset.surfaceClassName,
        className,
      )}
      style={[chrome?.surfaceStyle, style]}
      {...rest}
    >
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <AppText
        className={cn(
          "min-w-0 flex-1 text-xs font-medium leading-snug",
          chrome ? chrome.textClassName : preset.textClassName,
        )}
        style={chrome?.textStyle}
      >
        {message}
      </AppText>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={dismissAccessibilityLabel}
          className="p-0.5 active:opacity-60"
          hitSlop={10}
          onPress={onDismiss}
        >
          <Ionicons name="close" size={iconSize} color={iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
};

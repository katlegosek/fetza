import type { ViewStyle } from "react-native";

import { cn } from "@/lib/cn";

const CHIP_ROW_LAYOUT =
  "flex-row items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5";

const ASSIGN_MEMBER_CHIP_ROW_INACTIVE =
  "border border-stone-200/90 bg-white dark:border-neutral-700 dark:bg-neutral-900";

/**
 * Assign-only: Pressable is the chip — includes press feedback opacity.
 */
export const ASSIGN_MEMBER_CHIP_PRESSABLE_BASE = `${CHIP_ROW_LAYOUT} active:opacity-90`;

const CHIP_ROW_COMPACT =
  "flex-row items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5";

/** Static shell classes for assign person chips (border comes from `assignMemberChipBorderStyle`). */
export function assignMemberChipShellClassName(): string {
  return "flex-row items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 dark:bg-neutral-900";
}

function borderColorFromTone(tone: string): string {
  const match = tone.match(/border-\[(#[0-9A-Fa-f]{3,8})\]/i);
  return match?.[1] ?? "#123B3C";
}

/** Selected-state border uses inline styles so NativeWind does not remount the chip on tap. */
export function assignMemberChipBorderStyle(
  active: boolean,
  tone: string,
): ViewStyle {
  if (!active) {
    return {
      borderWidth: 1,
      borderColor: "#d6d3d1",
    };
  }

  return {
    borderWidth: 2,
    borderColor: borderColorFromTone(tone),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  };
}

/** Inner chip shell for Summary table (outer Pressable handles press opacity). */
export function assignMemberChipInactiveShellClassName(
  compact = false,
): string {
  return cn(
    compact ? CHIP_ROW_COMPACT : CHIP_ROW_LAYOUT,
    ASSIGN_MEMBER_CHIP_ROW_INACTIVE,
  );
}

/** @deprecated Prefer `assignMemberChipShellClassName` + `assignMemberChipBorderStyle`. */
export function assignMemberChipPressableClassName(
  active: boolean,
  tone: string,
): string {
  const parts = tone.trim().split(/\s+/);
  const borderToneClass = parts[1] ?? "";
  return cn(
    ASSIGN_MEMBER_CHIP_PRESSABLE_BASE,
    active
      ? cn("border-2 bg-white shadow-sm dark:bg-neutral-950", borderToneClass)
      : ASSIGN_MEMBER_CHIP_ROW_INACTIVE,
  );
}

/** First token of `Member.tone`, e.g. `bg-sky-500`. */
export function assignMemberAvatarBgClassName(tone: string): string {
  const parts = tone.trim().split(/\s+/);
  return parts[0] ?? "bg-neutral-500";
}

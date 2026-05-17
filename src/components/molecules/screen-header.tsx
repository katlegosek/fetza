import type { ReactNode } from "react";
import { Pressable, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms";
import { cn } from "@/lib/cn";

export type ScreenHeaderProps = ViewProps & {
  title: string;
  /** Muted line above the title. */
  topHint?: string;
  /** Muted line below the title. */
  bottomHint?: string;
  /** Title + hint text alignment. Default `"left"` (scan flow convention). */
  titleAlign?: "left" | "right";
  onBack?: () => void;
  /** e.g. header action (Split equally) — sits top-trailing, same row as title stack. */
  rightSlot?: ReactNode;
};

export type ScreenHeaderTextActionProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  /** Optional icon (e.g. people) shown before the label. */
  leading?: ReactNode;
};

/** Trailing header control; matches weight/tap opacity used for “Split equally”. */
export function ScreenHeaderTextAction({
  label,
  onPress,
  accessibilityLabel,
  leading,
}: ScreenHeaderTextActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className="max-w-[9rem] flex-row items-center gap-1 py-1 pl-2 active:opacity-70"
      onPress={onPress}
    >
      {leading}
      <AppText
        className="shrink text-right text-sm font-semibold leading-snug text-foreground"
        numberOfLines={2}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * Split-inspired chrome: circular back control, title stack (hints + title).
 */
export function ScreenHeader({
  title,
  topHint,
  bottomHint,
  titleAlign = "left",
  onBack,
  rightSlot,
  className,
  ...props
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const end = titleAlign === "right";
  const compact = !topHint && !bottomHint;

  return (
    <View
      className={cn(
        "flex-row gap-2 border-b border-borderSubtle px-4 pb-3",
        compact ? "items-center" : "items-start",
        className,
      )}
      style={{ paddingTop: insets.top + 8 }}
      {...props}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className={cn(
            "h-10 w-10 shrink-0 items-center justify-center rounded-full border border-borderSubtle bg-white active:opacity-85 dark:bg-background",
            !compact && "mt-0.5",
          )}
          hitSlop={10}
          onPress={onBack}
        >
          <AppText className="-mt-px text-2xl font-medium leading-none text-foreground">
            ‹
          </AppText>
        </Pressable>
      ) : (
        <View className={cn("h-10 w-10 shrink-0", !compact && "mt-0.5")} />
      )}

      <View
        className={cn(
          "min-w-0 flex-1",
          end ? "items-end" : "items-start",
          compact && "justify-center",
        )}
      >
        {topHint ? (
          <AppText
            className={cn(
              "text-[11px] leading-snug text-muted",
              end ? "text-right" : "text-left",
            )}
            numberOfLines={2}
          >
            {topHint}
          </AppText>
        ) : null}
        <AppText
          className={cn(
            "text-2xl font-bold tracking-tight text-foreground",
            end ? "text-right" : "text-left",
          )}
          numberOfLines={1}
        >
          {title}
        </AppText>
        {bottomHint ? (
          <AppText
            className={cn(
              "mt-0.5 text-[11px] leading-snug text-muted",
              end ? "text-right" : "text-left",
            )}
            numberOfLines={3}
          >
            {bottomHint}
          </AppText>
        ) : null}
      </View>

      {rightSlot ? (
        <View
          className={cn(
            "shrink-0",
            compact ? "self-center" : "mt-1 self-start",
          )}
        >
          {rightSlot}
        </View>
      ) : null}
    </View>
  );
}

import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/atoms";
import { useThemeColors } from "@/hooks";
import { cn } from "@/lib/cn";

export type ChatListRowSize = "md" | "lg";

export type ChatListRowProps = {
  leading: ReactNode;
  title: string;
  preview?: ReactNode;
  trailingTop?: ReactNode;
  trailingBottom?: ReactNode;
  showDivider?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  chevron?: boolean;
  footer?: ReactNode;
  size?: ChatListRowSize;
  titleNumberOfLines?: number;
  className?: string;
  /** Override inset divider margin when leading is wider than the default avatar. */
  dividerClassName?: string;
};

const SIZE_STYLES = {
  lg: {
    dividerInset: "ml-[76px]",
    title: "text-[17px] font-semibold text-foreground",
    preview: "text-[15px] text-muted",
  },
  md: {
    dividerInset: "ml-[68px]",
    title: "text-[16px] font-semibold text-foreground",
    preview: "text-[14px] text-muted",
  },
} as const;

/** WhatsApp-style list row: leading · title/preview · trailing meta · inset divider. */
export const ChatListRow = ({
  leading,
  title,
  preview,
  trailingTop,
  trailingBottom,
  showDivider = false,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  chevron = false,
  footer,
  size = "lg",
  titleNumberOfLines = 1,
  className,
  dividerClassName,
}: ChatListRowProps) => {
  const colors = useThemeColors();
  const styles = SIZE_STYLES[size];
  const content = (
    <>
      <View className="flex-row items-center gap-3 px-4 py-3">
        <View className="shrink-0 items-center justify-center">{leading}</View>

        <View className="min-w-0 flex-1">
          <View className="flex-row items-baseline justify-between gap-2">
            <AppText
              className={cn("min-w-0 flex-1", styles.title)}
              numberOfLines={titleNumberOfLines}
            >
              {title}
            </AppText>
            {trailingTop ? (
              typeof trailingTop === "string" ? (
                <AppText className="text-[12px] text-muted">
                  {trailingTop}
                </AppText>
              ) : (
                trailingTop
              )
            ) : null}
          </View>

          {preview != null || trailingBottom != null ? (
            <View className="mt-0.5 flex-row items-center justify-between gap-2">
              {preview != null ? (
                typeof preview === "string" ? (
                  <AppText
                    className={cn("min-w-0 flex-1", styles.preview)}
                    numberOfLines={1}
                  >
                    {preview}
                  </AppText>
                ) : (
                  <View className="min-w-0 flex-1">{preview}</View>
                )
              ) : (
                <View className="min-w-0 flex-1" />
              )}
              {trailingBottom != null ? (
                typeof trailingBottom === "string" ? (
                  <AppText className="text-[15px] font-medium tabular-nums text-foreground">
                    {trailingBottom}
                  </AppText>
                ) : (
                  trailingBottom
                )
              ) : null}
            </View>
          ) : null}
        </View>

        {chevron ? (
          <View className="shrink-0 self-center pl-0.5">
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        ) : null}
      </View>

      {footer}

      {showDivider ? (
        <View
          className={cn("h-px", dividerClassName ?? styles.dividerInset)}
          style={{ backgroundColor: colors.borderSubtle }}
        />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        className={cn(
          "active:bg-black/[0.04] dark:active:bg-white/10",
          disabled && "opacity-55",
          className,
        )}
        disabled={disabled}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View className={className}>{content}</View>;
};

export type ChatListAvatarProps = {
  label: string;
  backgroundColor: string;
  textColor?: string;
  size?: ChatListRowSize;
};

export const ChatListAvatar = ({
  label,
  backgroundColor,
  textColor = "#ffffff",
  size = "lg",
}: ChatListAvatarProps) => (
  <View
    className={cn(
      "items-center justify-center rounded-full",
      size === "lg" ? "size-14" : "size-12",
    )}
    style={{ backgroundColor }}
  >
    <AppText
      className={cn(
        "font-semibold",
        size === "lg" ? "text-base" : "text-[13px]",
      )}
      style={{ color: textColor }}
    >
      {label}
    </AppText>
  </View>
);

export type ChatListIconAvatarProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  color?: string;
  backgroundClassName?: string;
  size?: ChatListRowSize;
};

export const ChatListIconAvatar = ({
  name,
  color = "#7c3aed",
  backgroundClassName = "bg-violet-500/15 dark:bg-violet-500/20",
  size = "lg",
}: ChatListIconAvatarProps) => (
  <View
    className={cn(
      "items-center justify-center rounded-full",
      size === "lg" ? "size-14" : "size-12",
      backgroundClassName,
    )}
  >
    <Ionicons name={name} size={size === "lg" ? 22 : 20} color={color} />
  </View>
);

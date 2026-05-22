import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable } from "react-native";

import { AppText } from "@/components/atoms";
import { useThemeColors } from "@/hooks";

import { ScreenFeedbackLayout } from "./screen-feedback-layout";

export type ScreenErrorStateProps = {
  title?: string;
  topHint?: string;
  message: string;
  onBack?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  containerClassName?: string;
  showHeader?: boolean;
};

export function ScreenErrorState({
  title,
  topHint,
  message,
  onBack,
  actionLabel = "Try again",
  onAction,
  icon,
  containerClassName,
  showHeader,
}: ScreenErrorStateProps) {
  const colors = useThemeColors();

  return (
    <ScreenFeedbackLayout
      title={title}
      topHint={topHint}
      onBack={onBack}
      containerClassName={containerClassName}
      showHeader={showHeader}
      bodyClassName="gap-4"
    >
      {icon != null ? (
        <Ionicons name={icon} size={40} color={colors.muted} />
      ) : null}
      <AppText className="text-center text-sm text-foreground">
        {message}
      </AppText>
      {onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="rounded-xl border border-borderSubtle px-4 py-2 active:opacity-70"
          onPress={onAction}
        >
          <AppText className="text-sm font-medium text-foreground">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </ScreenFeedbackLayout>
  );
}

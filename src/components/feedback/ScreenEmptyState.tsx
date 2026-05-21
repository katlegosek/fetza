import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { AppText, Button } from "@/components";
import { ScreenFeedbackLayout } from "@/components/feedback/screen-feedback-layout";
import { useThemeColors } from "@/hooks";
import { cn } from "@/lib/cn";

export type ScreenEmptyStateProps = {
  title?: string;
  topHint?: string;
  message: string;
  onBack?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  containerClassName?: string;
  bodyClassName?: string;
  messageClassName?: string;
  showHeader?: boolean;
};

export function ScreenEmptyState({
  title,
  topHint,
  message,
  onBack,
  actionLabel = "Go back",
  onAction,
  icon,
  containerClassName,
  bodyClassName,
  messageClassName,
  showHeader,
}: ScreenEmptyStateProps) {
  const colors = useThemeColors();
  const handleAction = onAction ?? onBack;

  return (
    <ScreenFeedbackLayout
      title={title}
      topHint={topHint}
      onBack={onBack}
      containerClassName={containerClassName}
      showHeader={showHeader}
      bodyClassName={cn("gap-0", bodyClassName)}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={40}
          color={colors.muted}
          style={{ marginBottom: 12 }}
        />
      ) : null}
      <AppText
        className={cn("text-center text-sm text-muted", messageClassName)}
      >
        {message}
      </AppText>
      {handleAction ? (
        <Button className="mt-6 w-full" onPress={handleAction}>
          {actionLabel}
        </Button>
      ) : null}
    </ScreenFeedbackLayout>
  );
}

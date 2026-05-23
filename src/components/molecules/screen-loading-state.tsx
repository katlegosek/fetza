import { ActivityIndicator } from "react-native";

import { AppText } from "@/components/atoms";

import { ScreenFeedbackLayout } from "./screen-feedback-layout";

export type ScreenLoadingStateProps = {
  title?: string;
  topHint?: string;
  message: string;
  onBack?: () => void;
  containerClassName?: string;
  showHeader?: boolean;
  loadingAccessibilityLabel?: string;
};

export const ScreenLoadingState = ({
  title,
  topHint,
  message,
  onBack,
  containerClassName,
  showHeader,
  loadingAccessibilityLabel,
}: ScreenLoadingStateProps) => (
  <ScreenFeedbackLayout
    title={title}
    topHint={topHint}
    onBack={onBack}
    containerClassName={containerClassName}
    showHeader={showHeader}
    bodyClassName="gap-3"
  >
    <ActivityIndicator
      accessibilityLabel={loadingAccessibilityLabel ?? message}
    />
    <AppText className="text-sm text-muted">{message}</AppText>
  </ScreenFeedbackLayout>
);

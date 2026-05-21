import type { ReactNode } from "react";
import { View } from "react-native";

import { ScreenContainer, ScreenHeader } from "@/components";
import { cn } from "@/lib/cn";

export type ScreenFeedbackLayoutProps = {
  title?: string;
  topHint?: string;
  onBack?: () => void;
  containerClassName?: string;
  bodyClassName?: string;
  showHeader?: boolean;
  children: ReactNode;
};

export function shouldShowScreenFeedbackHeader(
  title?: string,
  onBack?: () => void,
  showHeader?: boolean,
): boolean {
  if (showHeader !== undefined) return showHeader;
  return title !== undefined || onBack !== undefined;
}

export function ScreenFeedbackLayout({
  title,
  topHint,
  onBack,
  containerClassName,
  bodyClassName,
  showHeader,
  children,
}: ScreenFeedbackLayoutProps) {
  const headerVisible = shouldShowScreenFeedbackHeader(
    title,
    onBack,
    showHeader,
  );

  return (
    <ScreenContainer
      className={cn(headerVisible && "flex-1", containerClassName)}
    >
      {headerVisible ? (
        <ScreenHeader title={title ?? ""} topHint={topHint} onBack={onBack} />
      ) : null}
      <View
        className={cn(
          headerVisible
            ? "flex-1 items-center justify-center px-6"
            : "items-center px-6",
          bodyClassName,
        )}
      >
        {children}
      </View>
    </ScreenContainer>
  );
}

import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

type ScreenContainerProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

/**
 * Default full-screen route wrapper (flex + bg-background via NativeWind).
 * Narrow auth layouts can be a separate component when you add login.
 */
export const ScreenContainer = ({
  children,
  className,
  ...props
}: ScreenContainerProps) => (
  <View className={cn("flex-1 bg-canvas", className)} {...props}>
    {children}
  </View>
);

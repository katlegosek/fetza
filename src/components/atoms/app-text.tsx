import type { ReactNode } from "react";
import { Text, type TextProps } from "react-native";

import { cn } from "@/lib/cn";

export type AppTextProps = TextProps & {
  children?: ReactNode;
  className?: string;
  isError?: boolean;
};

export function AppText({ className, isError, ...props }: AppTextProps) {
  return (
    <Text
      className={cn(isError && "mt-2 text-sm text-red-600", className)}
      {...props}
    />
  );
}

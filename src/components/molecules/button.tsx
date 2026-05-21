import type { ReactNode } from "react";

import {
  AppText,
  PressableButton,
  type PressableButtonProps,
} from "@/components/atoms";
import { cn } from "@/lib/cn";

export type ButtonProps = Omit<PressableButtonProps, "children"> & {
  children: ReactNode;
  textClassName?: string;
};

export function Button({ children, textClassName, ...props }: ButtonProps) {
  const content =
    typeof children === "string" ? (
      <AppText
        className={cn(
          "text-center text-lg font-semibold text-background",
          textClassName,
        )}
      >
        {children}
      </AppText>
    ) : (
      children
    );

  return <PressableButton {...props}>{content}</PressableButton>;
}

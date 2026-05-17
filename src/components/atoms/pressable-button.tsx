import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/lib/cn";

const pressableChrome =
  "rounded-2xl bg-foreground px-10 py-4 active:opacity-90";

const disabledChrome =
  "bg-neutral-300 active:opacity-100 dark:bg-neutral-600 dark:active:opacity-100";

export type PressableButtonProps = Omit<PressableProps, "children"> & {
  children?: ReactNode;
  className?: string;
};

export function PressableButton({
  children,
  className,
  accessibilityRole = "button",
  accessibilityState,
  disabled,
  ...props
}: PressableButtonProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      className={cn(
        pressableChrome,
        disabled ? disabledChrome : undefined,
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Pressable>
  );
}

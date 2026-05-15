import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/lib/cn";

const pressableChrome =
  "rounded-2xl bg-foreground px-10 py-4 active:opacity-90";

export type PressableButtonProps = Omit<PressableProps, "children"> & {
  children?: ReactNode;
  className?: string;
};

export function PressableButton({
  children,
  className,
  accessibilityRole = "button",
  ...props
}: PressableButtonProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      className={cn(pressableChrome, className)}
      {...props}
    >
      {children}
    </Pressable>
  );
}

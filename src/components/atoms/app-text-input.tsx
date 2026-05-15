import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";

export type AppTextInputProps = TextInputProps & {
  className?: string;
};

export function AppTextInput({ className, ...props }: AppTextInputProps) {
  return <TextInput className={cn(className)} {...props} />;
}

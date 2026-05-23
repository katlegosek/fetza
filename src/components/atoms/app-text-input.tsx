import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";

export type AppTextInputProps = TextInputProps & {
  className?: string;
};

export const AppTextInput = ({ className, ...props }: AppTextInputProps) => (
  <TextInput className={cn(className)} {...props} />
);

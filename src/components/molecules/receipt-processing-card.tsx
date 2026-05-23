import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { AppText } from "@/components/atoms";
import { useThemeColors } from "@/hooks";

export const RECEIPT_PROCESSING_STEPS = [
  "Uploading receipt",
  "Reading items",
  "Checking totals",
  "Preparing review",
] as const;

export type ReceiptProcessingCardProps = {
  /** Index of the step currently in progress (0-based). */
  activeStepIndex: number;
  /** When true, all steps show as complete (e.g. receipt ready). */
  allComplete?: boolean;
  subtitle?: string;
};

export const ReceiptProcessingCard = ({
  activeStepIndex,
  allComplete = false,
  subtitle = "This usually takes a few seconds.",
}: ReceiptProcessingCardProps) => {
  const colors = useThemeColors();

  return (
    <View className="w-full gap-4 rounded-2xl border border-borderSubtle bg-background px-5 py-5 shadow-sm shadow-black/10">
      <View className="gap-1">
        <AppText className="text-lg font-semibold text-foreground">
          Processing receipt
        </AppText>
        <AppText className="text-sm text-muted">{subtitle}</AppText>
      </View>

      <View className="gap-3">
        {RECEIPT_PROCESSING_STEPS.map((label, index) => {
          const done = allComplete || index < activeStepIndex;
          const active = !allComplete && index === activeStepIndex;

          return (
            <View key={label} className="flex-row items-center gap-3">
              <View
                className="size-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor: done
                    ? colors.foreground
                    : active
                      ? colors.borderSubtle
                      : "transparent",
                  borderWidth: done || active ? 0 : 1,
                  borderColor: colors.borderSubtle,
                }}
              >
                {done ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.background}
                  />
                ) : active ? (
                  <View
                    className="size-2 rounded-full"
                    style={{ backgroundColor: colors.foreground }}
                  />
                ) : null}
              </View>
              <AppText
                className={
                  done || active
                    ? "text-sm font-medium text-foreground"
                    : "text-sm text-muted"
                }
              >
                {label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

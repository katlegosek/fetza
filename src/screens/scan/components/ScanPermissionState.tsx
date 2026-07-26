import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppText, Button, ScreenContainer, ScreenHeader } from "@/components";
import { useThemeColors } from "@/hooks";

export type ScanPermissionStateVariant = "loading" | "denied" | "unavailable";

export type ScanPermissionStateProps = {
  variant: ScanPermissionStateVariant;
  onBack: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onPickLibrary?: () => void;
  onManual?: () => void;
};

const COPY: Record<
  ScanPermissionStateVariant,
  { icon: keyof typeof Ionicons.glyphMap; message: string }
> = {
  loading: {
    icon: "camera-outline",
    message: "Preparing the camera…",
  },
  denied: {
    icon: "lock-closed-outline",
    message: "Camera access is needed to scan receipts.",
  },
  unavailable: {
    icon: "camera-reverse-outline",
    message:
      "The camera isn't available on this device. You can still add a receipt another way.",
  },
};

export const ScanPermissionState = ({
  variant,
  onBack,
  primaryActionLabel,
  onPrimaryAction,
  onPickLibrary,
  onManual,
}: ScanPermissionStateProps) => {
  const colors = useThemeColors();
  const { icon, message } = COPY[variant];
  const showFallback = variant === "denied" || variant === "unavailable";

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader title="Scan receipt" onBack={onBack} />

      <View className="flex-1 items-center justify-center gap-5 px-8">
        {variant === "loading" ? (
          <ActivityIndicator color={colors.foreground} size="large" />
        ) : (
          <View className="size-16 items-center justify-center rounded-full border border-borderSubtle bg-background">
            <Ionicons name={icon} size={30} color={colors.foreground} />
          </View>
        )}

        <AppText className="max-w-[280px] text-center text-base leading-6 text-muted">
          {message}
        </AppText>

        {variant === "denied" && primaryActionLabel && onPrimaryAction ? (
          <Button className="w-full max-w-[320px]" onPress={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        ) : null}

        {showFallback ? (
          <View className="w-full max-w-[320px] gap-3">
            {onPickLibrary ? (
              <Pressable
                accessibilityLabel="Choose from library"
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-borderSubtle bg-background px-5 py-3 active:opacity-80"
                onPress={onPickLibrary}
              >
                <Ionicons
                  name="images-outline"
                  size={18}
                  color={colors.foreground}
                />
                <AppText className="text-base font-semibold text-foreground">
                  Choose from library
                </AppText>
              </Pressable>
            ) : null}

            {onManual ? (
              <Pressable
                accessibilityLabel="Add manually"
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-borderSubtle bg-background px-5 py-3 active:opacity-80"
                onPress={onManual}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={colors.foreground}
                />
                <AppText className="text-base font-semibold text-foreground">
                  Add manually
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

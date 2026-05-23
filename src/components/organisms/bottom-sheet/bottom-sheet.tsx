import { useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "@/components/atoms";

import { SheetCloseButton } from "./sheet-close-button";
import type { BottomSheetProps } from "./types";
import { useBottomSheetAppearance } from "./use-bottom-sheet-appearance";

export const BottomSheet = ({
  visible,
  onClose,
  bottomInset = 0,
  title,
  subtitle,
  children,
}: BottomSheetProps) => {
  const a = useBottomSheetAppearance();

  const translateY = useSharedValue(visible ? 0 : 600);
  const backdrop = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 600, { duration: 260 });
    backdrop.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, translateY, backdrop]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          className="absolute inset-0 bg-black/45"
          style={backdropStyle}
        >
          <Pressable
            accessibilityRole="button"
            className="flex-1"
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          className="rounded-t-3xl px-6 pt-3"
          style={[
            {
              backgroundColor: a.sheetBg,
              paddingBottom: bottomInset + 28,
            },
            sheetStyle,
          ]}
        >
          <View className="mb-3 flex-row items-center">
            <View className="w-9 shrink-0" />
            <View className="min-w-0 flex-1 items-center">
              <View
                className="h-[5px] w-12 rounded-full"
                style={{ backgroundColor: a.handle }}
              />
            </View>
            <View className="w-9 shrink-0 items-end">
              <SheetCloseButton onPress={onClose} />
            </View>
          </View>

          <AppText className="text-[22px] font-bold" style={{ color: a.ink }}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText className="mb-3 mt-1 text-sm" style={{ color: a.muted }}>
              {subtitle}
            </AppText>
          ) : null}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

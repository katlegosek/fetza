import { useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/atoms";
import {
  SheetCloseButton,
  useBottomSheetAppearance,
} from "@/components/organisms";
import { useThemeColors } from "@/hooks";

export type ClearReceiptSheetProps = {
  visible: boolean;
  bottomInset?: number;
  onClose: () => void;
  onConfirmClear: () => void;
};

/**
 * Destructive confirm sheet for clearing all receipt lines — single primary action only.
 */
export const ClearReceiptSheet = ({
  visible,
  bottomInset = 0,
  onClose,
  onConfirmClear,
}: ClearReceiptSheetProps) => {
  const a = useBottomSheetAppearance();
  const colors = useThemeColors();

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

  const confirm = () => {
    onConfirmClear();
    onClose();
  };

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
            accessibilityLabel="Dismiss"
            className="flex-1"
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          className="rounded-t-3xl px-6 pt-4"
          style={[
            {
              backgroundColor: a.sheetBg,
              paddingBottom: bottomInset + 28,
            },
            sheetStyle,
          ]}
        >
          <View className="mb-4 flex-row justify-end">
            <SheetCloseButton onPress={onClose} />
          </View>

          <View className="mb-5 size-14 self-center items-center justify-center rounded-full bg-red-500/15">
            <Ionicons name="trash-outline" size={28} color="#dc2626" />
          </View>

          <AppText className="text-[22px] font-bold" style={{ color: a.ink }}>
            Clear receipt?
          </AppText>
          <AppText
            className="mt-2 text-base leading-snug"
            style={{ color: a.muted }}
          >
            This will remove the scanned receipt and all detected items.
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear receipt"
            className="mt-8 w-full items-center justify-center rounded-2xl bg-red-600 py-4 active:opacity-90"
            onPress={confirm}
          >
            <AppText
              className="text-base font-semibold"
              style={{ color: colors.background }}
            >
              Clear receipt
            </AppText>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "@/components/atoms";

import type { BottomSheetProps } from "./types";
import { useBottomSheetAppearance } from "./use-bottom-sheet-appearance";

/**
 * Reusable modal bottom sheet: dimmed backdrop, slide-up panel, handle, title area, body slot.
 */
export function BottomSheet({
  visible,
  onClose,
  bottomInset = 0,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
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
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.backdropPressable}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: a.sheetBg,
              paddingBottom: bottomInset + 28,
            },
            sheetStyle,
          ]}
        >
          <View style={[styles.handle, { backgroundColor: a.handle }]} />

          <AppText style={[styles.title, { color: a.ink }]}>{title}</AppText>
          {subtitle ? (
            <AppText style={[styles.subline, { color: a.muted }]}>
              {subtitle}
            </AppText>
          ) : null}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdropPressable: { flex: 1 },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subline: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
  },
});

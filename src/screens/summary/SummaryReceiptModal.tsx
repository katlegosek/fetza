import { useEffect, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RECEIPT_ZIGZAG_DEPTH, ThermalReceipt } from "@/components";
import type { DraftBill } from "@/mocks/review-draft.mock";
import {
  SUMMARY_RECEIPT_MODAL_INNER_PAD_Y,
  SUMMARY_RECEIPT_MODAL_SHIFT_DOWN,
  SUMMARY_RECEIPT_MODAL_VERTICAL_MARGIN,
} from "@/screens/summary/summary.constants";

export type SummaryReceiptModalProps = {
  draft: DraftBill;
  onClose: () => void;
  visible: boolean;
};

export const SummaryReceiptModal = ({
  draft,
  onClose,
  visible,
}: SummaryReceiptModalProps) => {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const receiptWidth = Math.min(352, width - 48);
  const maxBodyHeight = Math.max(
    0,
    height -
      insets.top -
      insets.bottom -
      SUMMARY_RECEIPT_MODAL_INNER_PAD_Y -
      SUMMARY_RECEIPT_MODAL_VERTICAL_MARGIN,
  );

  const backdropOp = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0.9);
  const translateY = useSharedValue(visible ? 0 : 28);

  useEffect(() => {
    if (visible) {
      backdropOp.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 16, stiffness: 260 });
      translateY.value = withSpring(0, { damping: 16, stiffness: 260 });
    } else {
      backdropOp.value = withTiming(0, { duration: 180 });
      scale.value = withTiming(0.9, { duration: 180 });
      translateY.value = withTiming(32, { duration: 180 });
    }
  }, [backdropOp, scale, translateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOp.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: backdropOp.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const noop = useMemo(
    () => ({
      add: () => {},
      line: (_id: string) => {},
      merchant: () => {},
      totals: () => {},
    }),
    [],
  );

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        className="flex-1 justify-center px-3"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
      >
        <Animated.View
          className="absolute inset-0 bg-black/50"
          style={backdropStyle}
        >
          <Pressable
            accessibilityLabel="Dismiss receipt"
            accessibilityRole="button"
            className="flex-1"
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          className="max-w-full self-center"
          pointerEvents="box-none"
          style={[cardStyle, { marginTop: SUMMARY_RECEIPT_MODAL_SHIFT_DOWN }]}
        >
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingTop: RECEIPT_ZIGZAG_DEPTH + 8,
              paddingBottom: RECEIPT_ZIGZAG_DEPTH + 16,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: maxBodyHeight }}
          >
            <ThermalReceipt
              draft={draft}
              readOnly
              width={receiptWidth}
              onAddLine={noop.add}
              onLinePress={noop.line}
              onMerchantPress={noop.merchant}
              onTotalsPress={noop.totals}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

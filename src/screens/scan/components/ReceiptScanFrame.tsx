import { useEffect, useRef, useState } from "react";
import { Animated, type LayoutChangeEvent, View } from "react-native";

const SCAN_LINE_HEIGHT = 72;

export type ReceiptScanFrameProps = {
  /** Loops the scan beam only while the camera preview is live and idle. */
  active?: boolean;
};

/**
 * Corner-bracket receipt guide with a looping scan beam. Renders full-bleed
 * inside its parent (no continuous border) so it can stretch to whatever
 * capture area the screen gives it.
 */
export const ReceiptScanFrame = ({ active = true }: ReceiptScanFrameProps) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [frameHeight, setFrameHeight] = useState(0);

  useEffect(() => {
    if (!active || frameHeight <= 0) {
      progress.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          duration: 2_400,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          duration: 0,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [active, frameHeight, progress]);

  const onLayout = (event: LayoutChangeEvent) => {
    setFrameHeight(event.nativeEvent.layout.height);
  };

  const scanLineTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(frameHeight - SCAN_LINE_HEIGHT, 0)],
  });

  return (
    <View className="flex-1 self-stretch overflow-hidden" onLayout={onLayout}>
      <View className="absolute left-0 top-0 h-12 w-12 rounded-tl-2xl border-l-[3px] border-t-[3px] border-emerald-300" />
      <View className="absolute right-0 top-0 h-12 w-12 rounded-tr-2xl border-r-[3px] border-t-[3px] border-emerald-300" />
      <View className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-b-[3px] border-l-[3px] border-emerald-300" />
      <View className="absolute bottom-0 right-0 h-12 w-12 rounded-br-2xl border-b-[3px] border-r-[3px] border-emerald-300" />

      {active && frameHeight > 0 ? (
        <Animated.View
          className="absolute left-2 right-2"
          style={{
            height: SCAN_LINE_HEIGHT,
            transform: [{ translateY: scanLineTranslate }],
            backgroundColor: "rgba(16, 185, 129, 0.08)",
            borderBottomColor: "#6ee7b7",
            borderBottomWidth: 1.5,
          }}
        />
      ) : null}
    </View>
  );
};

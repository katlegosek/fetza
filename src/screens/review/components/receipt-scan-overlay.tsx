import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export const ReceiptScanOverlay = ({ active }: { active: boolean }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progress.stopAnimation();
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          duration: 1_900,
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
  }, [active, progress]);

  if (!active) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 570],
  });

  return (
    <View
      className="absolute inset-0 z-20 overflow-hidden"
      pointerEvents="none"
    >
      <Animated.View
        className="absolute left-2 right-2 h-16"
        style={{
          transform: [{ translateY }],
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          borderBottomColor: "rgba(14, 165, 233, 0.65)",
          borderBottomWidth: 1.5,
          shadowColor: "#10b981",
          shadowOpacity: 0.45,
          shadowRadius: 12,
        }}
      />
    </View>
  );
};

import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

import { AppText } from "@/components";

/**
 * AI discovery pill ("+ Restaurant detected"). Springs up + fades in, holds,
 * then slides up + fades out — a "Slide-In Fade" entrance with a liquid feel.
 */
export const ReceiptDiscoveryPill = ({ label }: { label: string | null }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!label) return;

    opacity.setValue(0);
    translateY.setValue(10);
    scale.setValue(0.95);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 10,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 12,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 12,
        }),
      ]),
      Animated.delay(1_800),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
    return () => animation.stop();
  }, [label, opacity, translateY, scale]);

  if (!label) return null;

  return (
    <Animated.View
      className="absolute -right-2 top-20 z-30 flex-row items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-md shadow-emerald-950/15"
      style={{ opacity, transform: [{ translateY }, { scale }] }}
    >
      <Ionicons name="sparkles" size={15} color="#047857" />
      <AppText className="text-xs font-bold text-emerald-800">{label}</AppText>
    </Animated.View>
  );
};

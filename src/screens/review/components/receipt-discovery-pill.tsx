import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

import { AppText, GlassSurface } from "@/components";
import { canUseLiquidGlass } from "@/lib/liquid-glass";

const USE_LIQUID_GLASS = canUseLiquidGlass();

/**
 * AI discovery pill. Liquid Glass is never placed under an animated-opacity
 * parent: supported iOS uses movement/scale then unmounts, while fallback
 * materials can safely fade.
 */
export const ReceiptDiscoveryPill = ({ label }: { label: string | null }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!label) {
      setVisible(false);
      return;
    }

    setVisible(true);
    opacity.setValue(USE_LIQUID_GLASS ? 1 : 0);
    translateY.setValue(10);
    scale.setValue(0.95);

    const enter = Animated.parallel([
      ...(USE_LIQUID_GLASS
        ? []
        : [
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
              speed: 12,
              bounciness: 10,
            }),
          ]),
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
    ]);

    const exit = Animated.parallel([
      ...(USE_LIQUID_GLASS
        ? []
        : [
            Animated.timing(opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
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
    ]);

    const animation = Animated.sequence([enter, Animated.delay(2_800), exit]);
    animation.start(({ finished }) => {
      if (finished) setVisible(false);
    });

    return () => animation.stop();
  }, [label, opacity, translateY, scale]);

  if (!label || !visible) return null;

  return (
    <Animated.View
      className="absolute -right-2 top-20 z-30"
      style={{
        ...(USE_LIQUID_GLASS ? null : { opacity }),
        transform: [{ translateY }, { scale }],
      }}
    >
      <GlassSurface
        blurIntensity={34}
        blurTint="light"
        className="flex-row items-center gap-2 rounded-full px-3 py-2"
        fallbackClassName="border border-emerald-200 bg-emerald-50 shadow-md shadow-emerald-950/15"
        glassEffectStyle="regular"
        materialBackgroundColor="#ecfdf5"
        materialElevation={4}
        tintColor="rgba(5,150,105,0.16)"
      >
        <Ionicons name="sparkles" size={15} color="#047857" />
        <AppText className="text-xs font-bold text-emerald-800">
          {label}
        </AppText>
      </GlassSurface>
    </Animated.View>
  );
};

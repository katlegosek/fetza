import { Animated, View } from "react-native";

export const ReceiptSkeletonRow = ({
  opacity,
  compact = false,
}: {
  opacity: Animated.AnimatedInterpolation<number>;
  compact?: boolean;
}) => {
  return (
    <View className="flex-row items-center justify-between border-b border-stone-400/20 py-2.5">
      <Animated.View
        className={
          compact ? "h-2.5 w-28 rounded-full" : "h-3 w-44 rounded-full"
        }
        style={{ backgroundColor: "#d6d3d1", opacity }}
      />
      <Animated.View
        className="h-3 w-16 rounded-full"
        style={{ backgroundColor: "#d6d3d1", opacity }}
      />
    </View>
  );
};

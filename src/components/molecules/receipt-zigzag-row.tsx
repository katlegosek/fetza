import { View } from "react-native";

export const RECEIPT_ZIGZAG_TOOTH = 14;
export const RECEIPT_ZIGZAG_DEPTH = 9;

export type ReceiptZigzagRowProps = {
  teethCount: number;
  color: string;
  pointUp?: boolean;
};

export const ReceiptZigzagRow = ({
  teethCount,
  color,
  pointUp = false,
}: ReceiptZigzagRowProps) => {
  const halfTooth = RECEIPT_ZIGZAG_TOOTH / 2;
  const toothStyle = {
    borderLeftWidth: halfTooth,
    borderRightWidth: halfTooth,
    borderTopWidth: pointUp ? 0 : RECEIPT_ZIGZAG_DEPTH,
    borderBottomWidth: pointUp ? RECEIPT_ZIGZAG_DEPTH : 0,
    borderTopColor: pointUp ? "transparent" : color,
    borderBottomColor: pointUp ? color : "transparent",
  };

  return (
    <View className="flex-row" style={{ height: RECEIPT_ZIGZAG_DEPTH }}>
      {[...Array(teethCount)].map((_, toothIndex) => (
        <View
          key={`zigzag-${teethCount}-${pointUp ? "up" : "dn"}-${toothIndex}`}
          className="w-0 h-0 border-solid border-l-transparent border-r-transparent"
          style={toothStyle}
        />
      ))}
    </View>
  );
};

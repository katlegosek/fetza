import { View } from "react-native";

export type FauxBarcodeProps = {
  seed: string;
  foregroundColor: string;
};

type BarSpec = {
  stripeWidth: number;
  isTallStripe: boolean;
};

export const FauxBarcode = ({ seed, foregroundColor }: FauxBarcodeProps) => {
  const barSpecs = (): BarSpec[] =>
    seed.split("").map((character, index) => {
      const codeUnit = character.charCodeAt(0);
      const stripeWidth = 1 + ((codeUnit + index * 7) % 4);
      const isTallStripe = (codeUnit + index) % 5 === 0;
      return { stripeWidth, isTallStripe };
    });

  return (
    <View className="mt-5 flex-row items-end justify-center gap-[1.5px]">
      {barSpecs().map((spec, index) => (
        <View
          key={`${seed}:${index}:${spec.stripeWidth}:${spec.isTallStripe}`}
          style={{
            width: spec.stripeWidth,
            height: spec.isTallStripe ? 44 : 36,
            backgroundColor: foregroundColor,
          }}
        />
      ))}
    </View>
  );
};

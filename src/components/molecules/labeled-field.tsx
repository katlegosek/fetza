import type { ReactNode } from "react";
import { View } from "react-native";

import { AppText } from "@/components/atoms";
// Relative path: importing @/components/organisms here would cycle (organisms → thermal → molecules).
import { bottomSheetFormStyles as fs } from "../organisms/bottom-sheet/sheet-form-styles";

export type LabeledFieldProps = {
  label: string;
  labelColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  children: ReactNode;
  /** Shown in error style below the field card when set. */
  error?: string | null;
};

export function LabeledField({
  label,
  labelColor,
  cardBackgroundColor,
  cardBorderColor,
  children,
  error,
}: LabeledFieldProps) {
  return (
    <>
      <AppText style={[fs.fieldLabel, { color: labelColor }]}>{label}</AppText>
      <View
        style={[
          fs.fieldCard,
          {
            backgroundColor: cardBackgroundColor,
            borderColor: cardBorderColor,
          },
        ]}
      >
        {children}
      </View>
      {error ? <AppText isError>{error}</AppText> : null}
    </>
  );
}

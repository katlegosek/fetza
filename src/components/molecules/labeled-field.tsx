import type { ReactNode } from "react";
import { View } from "react-native";

import { AppText } from "@/components/atoms";
// Relative path: importing @/components/organisms here would cycle (organisms → thermal → molecules).
import { bottomSheetFormClasses } from "../organisms/bottom-sheet/sheet-form-classes";

export type LabeledFieldProps = {
  label: string;
  labelColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  children: ReactNode;
  error?: string | null;
};

export const LabeledField = ({
  label,
  labelColor,
  cardBackgroundColor,
  cardBorderColor,
  children,
  error,
}: LabeledFieldProps) => (
  <>
    <AppText
      className={bottomSheetFormClasses.fieldLabel}
      style={{ color: labelColor }}
    >
      {label}
    </AppText>
    <View
      className={bottomSheetFormClasses.fieldCard}
      style={{
        backgroundColor: cardBackgroundColor,
        borderColor: cardBorderColor,
      }}
    >
      {children}
    </View>
    {error ? <AppText isError>{error}</AppText> : null}
  </>
);

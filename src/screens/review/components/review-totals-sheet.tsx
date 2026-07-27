import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { AppText, AppTextInput } from "@/components/atoms";
import { LabeledField, NativeGlassButton } from "@/components/molecules";
import {
  BottomSheet,
  bottomSheetFormClasses as sheetForm,
  useBottomSheetAppearance,
} from "@/components/organisms";
import { formatZAR, parseMoneyInputToCents } from "@/lib/helper";

export type SaveBillFees = {
  vatCents: number;
  serviceFeeCents: number;
};

export type ReviewTotalsSheetProps = {
  visible: boolean;
  /** Sum of line items in cents (read-only context). */
  subtotalCents: number;
  vatCents: number;
  serviceFeeCents: number;
  bottomInset?: number;
  onSave: (next: SaveBillFees) => void;
  onClose: () => void;
};

/**
 * Organism: sheet + fee fields (molecules) + summary + actions.
 * VAT and optional mandatory service fee — use 0 if a line is not on the slip.
 */
export const ReviewTotalsSheet = ({
  visible,
  subtotalCents,
  vatCents,
  serviceFeeCents,
  bottomInset = 0,
  onSave,
  onClose,
}: ReviewTotalsSheetProps) => {
  const a = useBottomSheetAppearance();
  const [vatValue, setVatValue] = useState((vatCents / 100).toFixed(2));
  const [serviceValue, setServiceValue] = useState(
    (serviceFeeCents / 100).toFixed(2),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setVatValue((vatCents / 100).toFixed(2));
      setServiceValue((serviceFeeCents / 100).toFixed(2));
      setError(null);
    }
  }, [visible, vatCents, serviceFeeCents]);

  const previewVatCents = useMemo(
    () => parseMoneyInputToCents(vatValue) ?? vatCents,
    [vatValue, vatCents],
  );
  const previewServiceCents = useMemo(
    () => parseMoneyInputToCents(serviceValue) ?? serviceFeeCents,
    [serviceValue, serviceFeeCents],
  );

  const previewTotalCents =
    subtotalCents + previewVatCents + previewServiceCents;

  const submit = () => {
    const nextVat = parseMoneyInputToCents(vatValue);
    const nextService = parseMoneyInputToCents(serviceValue);
    if (nextVat === null || nextService === null) {
      setError("Enter valid amounts (0 or positive numbers).");
      return;
    }
    setError(null);
    onSave({ vatCents: nextVat, serviceFeeCents: nextService });
    onClose();
  };

  return (
    <BottomSheet
      bottomInset={bottomInset}
      subtitle="Match VAT and any mandatory service fee on the slip — use 0 if a line does not appear."
      title="Fees & tax"
      visible={visible}
      onClose={onClose}
    >
      <LabeledField
        cardBackgroundColor={a.fieldBg}
        cardBorderColor={a.border}
        label="VAT / TAX (INCLUDED)"
        labelColor={a.muted}
      >
        <AppText
          className={sheetForm.currencyPrefix}
          style={{ color: a.muted }}
        >
          R
        </AppText>
        <AppTextInput
          className={sheetForm.fieldInput}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={a.muted}
          style={{ color: a.ink }}
          value={vatValue}
          onChangeText={setVatValue}
        />
      </LabeledField>

      <LabeledField
        cardBackgroundColor={a.fieldBg}
        cardBorderColor={a.border}
        error={error}
        label="SERVICE FEE / LEVY"
        labelColor={a.muted}
      >
        <AppText
          className={sheetForm.currencyPrefix}
          style={{ color: a.muted }}
        >
          R
        </AppText>
        <AppTextInput
          className={sheetForm.fieldInput}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={a.muted}
          style={{ color: a.ink }}
          value={serviceValue}
          onChangeText={setServiceValue}
        />
      </LabeledField>

      <AppText className={sheetForm.fieldLabel} style={{ color: a.muted }}>
        SUMMARY
      </AppText>
      <View style={{ gap: 6 }}>
        <AppText style={{ color: a.muted, fontSize: 14 }}>
          Subtotal {formatZAR(subtotalCents)}
        </AppText>
        <AppText style={{ color: a.muted, fontSize: 14 }}>
          VAT {formatZAR(previewVatCents)}
        </AppText>
        <AppText style={{ color: a.muted, fontSize: 14 }}>
          Service fee {formatZAR(previewServiceCents)}
        </AppText>
        <AppText style={{ color: a.ink, fontSize: 15, fontWeight: "600" }}>
          Grand total {formatZAR(previewTotalCents)}
        </AppText>
      </View>

      <View className={sheetForm.buttonRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          className={sheetForm.btnSecondary}
          style={{ borderColor: a.border }}
          onPress={onClose}
        >
          <AppText
            className={sheetForm.btnSecondaryText}
            style={{ color: a.ink }}
          >
            Cancel
          </AppText>
        </Pressable>
        <NativeGlassButton
          accessibilityLabel="Save fees and tax"
          className="min-w-[100px] flex-1"
          label="Save"
          systemImage="checkmark"
          variant="glassProminent"
          onPress={submit}
        />
      </View>
    </BottomSheet>
  );
};

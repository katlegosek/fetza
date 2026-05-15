import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { AppText, AppTextInput } from "@/components/atoms";
import { LabeledField } from "@/components/molecules";
import {
  bottomSheetFormStyles as fs,
  BottomSheet,
  useBottomSheetAppearance,
} from "@/components/organisms";

export type ReviewMerchantSheetProps = {
  visible: boolean;
  merchant: string;
  bottomInset?: number;
  onSave: (name: string) => void;
  onClose: () => void;
};

export function ReviewMerchantSheet({
  visible,
  merchant,
  bottomInset = 0,
  onSave,
  onClose,
}: ReviewMerchantSheetProps) {
  const a = useBottomSheetAppearance();
  const [value, setValue] = useState(merchant);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setValue(merchant);
      setError(null);
    }
  }, [visible, merchant]);

  const submit = () => {
    const t = value.trim();
    if (!t) {
      setError("Enter a bill title or merchant name.");
      return;
    }
    setError(null);
    onSave(t);
    onClose();
  };

  return (
    <BottomSheet
      bottomInset={bottomInset}
      subtitle="As shown on the receipt."
      title="Bill title"
      visible={visible}
      onClose={onClose}
    >
      <LabeledField
        cardBackgroundColor={a.fieldBg}
        cardBorderColor={a.border}
        error={error}
        label="MERCHANT OR NICKNAME"
        labelColor={a.muted}
      >
        <AppTextInput
          autoCapitalize="words"
          placeholder="e.g. Corner Bistro"
          placeholderTextColor={a.muted}
          style={[fs.fieldInput, { color: a.ink }]}
          value={value}
          onChangeText={setValue}
        />
      </LabeledField>

      <View style={fs.buttonRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={[fs.btnSecondary, { borderColor: a.border }]}
          onPress={onClose}
        >
          <AppText style={[fs.btnSecondaryText, { color: a.ink }]}>
            Cancel
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save merchant name"
          style={[fs.btnPrimary, { backgroundColor: a.ink }]}
          onPress={submit}
        >
          <AppText style={[fs.btnPrimaryText, { color: a.onPrimary }]}>
            Save
          </AppText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { AppText, AppTextInput } from "@/components/atoms";
import { LabeledField } from "@/components/molecules";
import {
  BottomSheet,
  bottomSheetFormClasses as sheetForm,
  useBottomSheetAppearance,
} from "@/components/organisms";
import { parseRandStringToCents } from "@/lib/helper";

export type ReviewItemSheetProps = {
  visible: boolean;
  itemDescription: string;
  amountCents: number;
  quantity: number;
  canDelete: boolean;
  bottomInset?: number;
  onSave: (next: {
    description: string;
    amountCents: number;
    qty: number;
  }) => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ReviewItemSheet({
  visible,
  itemDescription,
  amountCents,
  quantity,
  canDelete,
  bottomInset = 0,
  onSave,
  onDelete,
  onClose,
}: ReviewItemSheetProps) {
  const a = useBottomSheetAppearance();

  const [desc, setDesc] = useState(itemDescription);
  const [priceStr, setPriceStr] = useState((amountCents / 100).toFixed(2));
  const [qtyStr, setQtyStr] = useState(String(quantity));

  useEffect(() => {
    if (visible) {
      setDesc(itemDescription);
      setPriceStr((amountCents / 100).toFixed(2));
      setQtyStr(String(quantity));
    }
  }, [visible, itemDescription, amountCents, quantity]);

  const handleSave = () => {
    const q = Math.max(
      1,
      Number.parseInt(qtyStr.replace(/\D/g, "") || "1", 10),
    );
    const cents = parseRandStringToCents(priceStr);
    if (cents === null) return;
    onSave({
      description: desc.trim() || itemDescription,
      amountCents: cents,
      qty: q,
    });
    onClose();
  };

  return (
    <BottomSheet
      bottomInset={bottomInset}
      subtitle="Correct what was misread before you assign items."
      title="Fix item"
      visible={visible}
      onClose={onClose}
    >
      <LabeledField
        cardBackgroundColor={a.fieldBg}
        cardBorderColor={a.border}
        label="DESCRIPTION"
        labelColor={a.muted}
      >
        <AppTextInput
          className={sheetForm.fieldInput}
          placeholder="Item name"
          placeholderTextColor={a.muted}
          style={{ color: a.ink }}
          value={desc}
          onChangeText={setDesc}
        />
      </LabeledField>

      <LabeledField
        cardBackgroundColor={a.fieldBg}
        cardBorderColor={a.border}
        label="ITEM TOTAL"
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
          value={priceStr}
          onChangeText={setPriceStr}
        />
      </LabeledField>

      <LabeledField
        cardBackgroundColor={a.fieldBg}
        cardBorderColor={a.border}
        label="QTY (FOR RECEIPT)"
        labelColor={a.muted}
      >
        <AppTextInput
          className={sheetForm.fieldInput}
          keyboardType="number-pad"
          placeholder="1"
          placeholderTextColor={a.muted}
          style={{ color: a.ink }}
          value={qtyStr}
          onChangeText={setQtyStr}
        />
      </LabeledField>

      <View className={sheetForm.buttonRow}>
        {canDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove line"
            className={sheetForm.btnDanger}
            onPress={() => {
              onDelete();
              onClose();
            }}
          >
            <AppText className={sheetForm.btnDangerText}>Remove</AppText>
          </Pressable>
        ) : null}
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save line"
          className={sheetForm.btnPrimary}
          style={{ backgroundColor: a.ink }}
          onPress={handleSave}
        >
          <AppText
            className={sheetForm.btnPrimaryText}
            style={{ color: a.onPrimary }}
          >
            Save
          </AppText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

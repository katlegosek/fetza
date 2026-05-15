import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { AppText, AppTextInput } from "@/components/atoms";
import { LabeledField } from "@/components/molecules";
import {
  bottomSheetFormStyles as fs,
  BottomSheet,
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
          placeholder="Item name"
          placeholderTextColor={a.muted}
          style={[fs.fieldInput, { color: a.ink }]}
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
        <AppText style={[fs.currencyPrefix, { color: a.muted }]}>R</AppText>
        <AppTextInput
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={a.muted}
          style={[fs.fieldInput, { color: a.ink }]}
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
          keyboardType="number-pad"
          placeholder="1"
          placeholderTextColor={a.muted}
          style={[fs.fieldInput, { color: a.ink }]}
          value={qtyStr}
          onChangeText={setQtyStr}
        />
      </LabeledField>

      <View style={fs.buttonRow}>
        {canDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove line"
            style={fs.btnDanger}
            onPress={() => {
              onDelete();
              onClose();
            }}
          >
            <AppText style={fs.btnDangerText}>Remove</AppText>
          </Pressable>
        ) : null}
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
          accessibilityLabel="Save line"
          style={[fs.btnPrimary, { backgroundColor: a.ink }]}
          onPress={handleSave}
        >
          <AppText style={[fs.btnPrimaryText, { color: a.onPrimary }]}>
            Save
          </AppText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

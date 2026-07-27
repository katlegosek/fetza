import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { AppText, AppTextInput } from "@/components/atoms";
import { LabeledField, NativeGlassButton } from "@/components/molecules";
import {
  BottomSheet,
  bottomSheetFormClasses as sheetForm,
  useBottomSheetAppearance,
} from "@/components/organisms";
import { parseRandStringToCents } from "@/lib/helper";

export type ReviewItemSavePayload = {
  description: string;
  amountCents: number;
  qty: number;
};

export type ReviewItemSheetProps = {
  visible: boolean;
  itemDescription: string;
  amountCents: number;
  quantity: number;
  canDelete: boolean;
  /** True while opening the sheet for a new line (shows Clear instead of Cancel). */
  isNewItem?: boolean;
  isSaving?: boolean;
  bottomInset?: number;
  onSave: (next: ReviewItemSavePayload) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onClose: () => void;
};

export const ReviewItemSheet = ({
  visible,
  itemDescription,
  amountCents,
  quantity,
  canDelete,
  isNewItem = false,
  isSaving = false,
  bottomInset = 0,
  onSave,
  onDelete,
  onClose,
}: ReviewItemSheetProps) => {
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

  const resetFields = () => {
    setDesc("");
    setPriceStr("0.00");
    setQtyStr("1");
  };

  const handleSave = async () => {
    if (isSaving) return;

    const q = Math.max(
      1,
      Number.parseInt(qtyStr.replace(/\D/g, "") || "1", 10),
    );
    const cents = parseRandStringToCents(priceStr);
    if (cents === null) return;

    try {
      await Promise.resolve(
        onSave({
          description: desc.trim() || itemDescription,
          amountCents: cents,
          qty: q,
        }),
      );
      onClose();
    } catch {
      // Parent shows errors; keep the sheet open.
    }
  };

  const handleDelete = async () => {
    if (isSaving) return;

    try {
      await Promise.resolve(onDelete());
      onClose();
    } catch {
      // Parent shows errors; keep the sheet open.
    }
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
            disabled={isSaving}
            style={isSaving ? { opacity: 0.5 } : undefined}
            onPress={() => void handleDelete()}
          >
            <AppText className={sheetForm.btnDangerText}>Remove</AppText>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isNewItem ? "Clear fields" : "Cancel"}
          className={sheetForm.btnSecondary}
          disabled={isSaving}
          style={[
            { borderColor: a.border },
            isSaving ? { opacity: 0.5 } : undefined,
          ]}
          onPress={isNewItem ? resetFields : onClose}
        >
          <AppText
            className={sheetForm.btnSecondaryText}
            style={{ color: a.ink }}
          >
            {isNewItem ? "Clear" : "Cancel"}
          </AppText>
        </Pressable>
        <NativeGlassButton
          accessibilityLabel="Save line"
          className="min-w-[100px] flex-1"
          disabled={isSaving}
          label={isSaving ? "Saving…" : "Save"}
          systemImage="checkmark"
          variant="glassProminent"
          onPress={() => void handleSave()}
        />
      </View>
    </BottomSheet>
  );
};

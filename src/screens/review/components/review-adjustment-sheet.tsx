import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AppText, AppTextInput } from "@/components/atoms";
import { LabeledField, NativeGlassButton } from "@/components/molecules";
import {
  BottomSheet,
  bottomSheetFormClasses as sheetForm,
  useBottomSheetAppearance,
} from "@/components/organisms";
import { parseSignedMoneyInputToCents } from "@/lib/helper";
import type { ReceiptAdjustmentKind } from "@/services/receipts/types";

export type ReviewAdjustmentSavePayload = {
  label: string;
  kind: ReceiptAdjustmentKind;
  amountCents: number;
  affectsTotal: boolean;
};

const KIND_OPTIONS: ReadonlyArray<{
  value: ReceiptAdjustmentKind;
  label: string;
  defaultLabel: string;
}> = [
  { value: "tax", label: "Tax / VAT", defaultLabel: "VAT" },
  { value: "service_fee", label: "Service fee", defaultLabel: "Service fee" },
  { value: "tip", label: "Tip", defaultLabel: "Tip" },
  { value: "discount", label: "Discount", defaultLabel: "Discount" },
  { value: "delivery_fee", label: "Delivery", defaultLabel: "Delivery fee" },
  { value: "rounding", label: "Rounding", defaultLabel: "Rounding" },
  { value: "subtotal", label: "Subtotal", defaultLabel: "Subtotal" },
  { value: "other", label: "Other", defaultLabel: "Fee" },
];

export function defaultAffectsTotalForKind(
  kind: ReceiptAdjustmentKind,
): boolean {
  return kind !== "tax" && kind !== "subtotal";
}

export type ReviewAdjustmentSheetProps = {
  visible: boolean;
  label: string;
  kind: ReceiptAdjustmentKind;
  amountCents: number;
  affectsTotal: boolean;
  canDelete: boolean;
  isNew?: boolean;
  isSaving?: boolean;
  bottomInset?: number;
  onSave: (next: ReviewAdjustmentSavePayload) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onClose: () => void;
};

export const ReviewAdjustmentSheet = ({
  visible,
  label,
  kind,
  amountCents,
  affectsTotal,
  canDelete,
  isNew = false,
  isSaving = false,
  bottomInset = 0,
  onSave,
  onDelete,
  onClose,
}: ReviewAdjustmentSheetProps) => {
  const a = useBottomSheetAppearance();

  const [labelValue, setLabelValue] = useState(label);
  const [kindValue, setKindValue] = useState<ReceiptAdjustmentKind>(kind);
  const [amountStr, setAmountStr] = useState((amountCents / 100).toFixed(2));
  const [affectsTotalValue, setAffectsTotalValue] = useState(affectsTotal);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setLabelValue(label);
      setKindValue(kind);
      setAmountStr((amountCents / 100).toFixed(2));
      setAffectsTotalValue(affectsTotal);
      setFieldError(null);
    }
  }, [visible, label, kind, amountCents, affectsTotal]);

  const resetFields = () => {
    setLabelValue("");
    setKindValue("other");
    setAmountStr("0.00");
    setAffectsTotalValue(true);
    setFieldError(null);
  };

  const selectKind = (next: ReceiptAdjustmentKind) => {
    setKindValue(next);
    if (isNew) {
      const option = KIND_OPTIONS.find((o) => o.value === next);
      if (option && !labelValue.trim()) {
        setLabelValue(option.defaultLabel);
      }
      setAffectsTotalValue(defaultAffectsTotalForKind(next));
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    const trimmed = labelValue.trim();
    if (!trimmed) {
      setFieldError("Enter a label for this line.");
      return;
    }

    const cents = parseSignedMoneyInputToCents(amountStr);
    if (cents === null) {
      setFieldError("Enter a valid amount.");
      return;
    }

    setFieldError(null);

    try {
      await Promise.resolve(
        onSave({
          label: trimmed,
          kind: kindValue,
          amountCents: cents,
          affectsTotal: affectsTotalValue,
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
      subtitle="Fees, tax, tips, and discounts on the slip — use a negative amount for discounts."
      title={isNew ? "Add fee or tax" : "Edit fee or tax"}
      visible={visible}
      onClose={onClose}
    >
      <LabeledField
        cardBackgroundColor={a.fieldBg}
        cardBorderColor={a.border}
        error={fieldError}
        label="LABEL"
        labelColor={a.muted}
      >
        <AppTextInput
          className={sheetForm.fieldInput}
          placeholder="e.g. VAT (15%)"
          placeholderTextColor={a.muted}
          style={{ color: a.ink }}
          value={labelValue}
          onChangeText={setLabelValue}
        />
      </LabeledField>

      <AppText className={sheetForm.fieldLabel} style={{ color: a.muted }}>
        TYPE
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
      >
        {KIND_OPTIONS.map((option) => {
          const selected = kindValue === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              className="rounded-full border px-3 py-2"
              style={{
                borderColor: selected ? a.ink : a.border,
                backgroundColor: selected ? a.ink : a.fieldBg,
              }}
              onPress={() => selectKind(option.value)}
            >
              <AppText
                className="text-xs font-medium"
                style={{ color: selected ? a.onPrimary : a.ink }}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <LabeledField
        cardBackgroundColor={a.fieldBg}
        cardBorderColor={a.border}
        label="AMOUNT"
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
          value={amountStr}
          onChangeText={setAmountStr}
        />
      </LabeledField>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: affectsTotalValue }}
        accessibilityLabel="Counts toward bill total"
        className="flex-row items-center justify-between rounded-xl border px-4 py-3"
        style={{ borderColor: a.border, backgroundColor: a.fieldBg }}
        onPress={() => setAffectsTotalValue((v) => !v)}
      >
        <View className="min-w-0 flex-1 pr-3">
          <AppText className="text-sm font-medium" style={{ color: a.ink }}>
            Counts toward bill total
          </AppText>
          <AppText className="mt-1 text-xs" style={{ color: a.muted }}>
            Off for display-only lines (e.g. VAT shown separately).
          </AppText>
        </View>
        <View
          className="h-6 w-11 rounded-full px-0.5"
          style={{
            backgroundColor: affectsTotalValue ? a.ink : a.border,
            justifyContent: "center",
          }}
        >
          <View
            className="size-5 rounded-full bg-white"
            style={{
              alignSelf: affectsTotalValue ? "flex-end" : "flex-start",
            }}
          />
        </View>
      </Pressable>

      <View className={sheetForm.buttonRow}>
        {canDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove adjustment"
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
          accessibilityLabel={isNew ? "Clear fields" : "Cancel"}
          className={sheetForm.btnSecondary}
          disabled={isSaving}
          style={[
            { borderColor: a.border },
            isSaving ? { opacity: 0.5 } : undefined,
          ]}
          onPress={isNew ? resetFields : onClose}
        >
          <AppText
            className={sheetForm.btnSecondaryText}
            style={{ color: a.ink }}
          >
            {isNew ? "Clear" : "Cancel"}
          </AppText>
        </Pressable>
        <NativeGlassButton
          accessibilityLabel="Save adjustment"
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

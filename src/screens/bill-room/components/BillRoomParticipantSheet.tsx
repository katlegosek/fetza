import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

import {
  AppText,
  BottomSheet,
  bottomSheetFormClasses,
  useBottomSheetAppearance,
} from "@/components";
import type { BillRoomResponse } from "@/services/bill-room";

type Participant = BillRoomResponse["bill_participants"][number];

export const BillRoomParticipantSheet = ({
  visible,
  participant,
  bottomInset,
  busy,
  error,
  onClose,
  onSave,
  onRemove,
}: {
  visible: boolean;
  participant: Participant | null;
  bottomInset: number;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (name: string) => void;
  onRemove: (() => void) | null;
}) => {
  const appearance = useBottomSheetAppearance();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(participant?.name ?? "");
    setFieldError(null);
    setConfirmingRemove(false);
  }, [participant?.name, visible]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldError("Enter a name.");
      return;
    }

    setFieldError(null);
    onSave(trimmedName);
  };

  return (
    <BottomSheet
      bottomInset={bottomInset}
      subtitle={
        participant
          ? "Update this person or remove them from the room."
          : "Add someone manually when they cannot join through the link."
      }
      title={participant ? "Manage person" : "Add person"}
      visible={visible}
      onClose={onClose}
    >
      {confirmingRemove ? (
        <View className="mt-4 rounded-2xl bg-red-50 p-4 dark:bg-red-950/30">
          <AppText className="font-bold text-red-800 dark:text-red-200">
            Remove {participant?.name}?
          </AppText>
          <AppText className="mt-1 text-sm leading-5 text-red-700 dark:text-red-300">
            Their claims will be removed and shared items will be recalculated.
          </AppText>
          <View className="mt-4 flex-row gap-2">
            <Pressable
              className="flex-1 items-center rounded-xl border border-red-300 px-4 py-3 dark:border-red-800"
              disabled={busy}
              onPress={() => setConfirmingRemove(false)}
            >
              <AppText className="font-semibold text-red-800 dark:text-red-200">
                Keep
              </AppText>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-xl bg-red-700 px-4 py-3"
              disabled={busy}
              onPress={() => onRemove?.()}
            >
              {busy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <AppText className="font-semibold text-white">Remove</AppText>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <AppText
            className={bottomSheetFormClasses.fieldLabel}
            style={{ color: appearance.muted }}
          >
            NAME
          </AppText>
          <View
            className={bottomSheetFormClasses.fieldCard}
            style={{
              backgroundColor: appearance.fieldBg,
              borderColor: appearance.border,
            }}
          >
            <TextInput
              autoCapitalize="words"
              className={bottomSheetFormClasses.fieldInput}
              maxLength={80}
              placeholder="e.g. Naledi"
              placeholderTextColor={appearance.muted}
              returnKeyType="done"
              style={{ color: appearance.ink }}
              value={name}
              onChangeText={setName}
              onSubmitEditing={handleSave}
            />
          </View>

          {fieldError || error ? (
            <AppText className="mt-2 text-sm text-red-600">
              {fieldError ?? error}
            </AppText>
          ) : null}

          <View className={bottomSheetFormClasses.buttonRow}>
            {onRemove ? (
              <Pressable
                className={bottomSheetFormClasses.btnDanger}
                disabled={busy}
                onPress={() => setConfirmingRemove(true)}
              >
                <AppText className={bottomSheetFormClasses.btnDangerText}>
                  Remove
                </AppText>
              </Pressable>
            ) : null}
            <Pressable
              className={bottomSheetFormClasses.btnSecondary}
              disabled={busy}
              style={{ borderColor: appearance.border }}
              onPress={onClose}
            >
              <AppText
                className={bottomSheetFormClasses.btnSecondaryText}
                style={{ color: appearance.ink }}
              >
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              className={bottomSheetFormClasses.btnPrimary}
              disabled={busy}
              style={{ backgroundColor: appearance.ink }}
              onPress={handleSave}
            >
              {busy ? (
                <ActivityIndicator color={appearance.onPrimary} />
              ) : (
                <AppText
                  className={bottomSheetFormClasses.btnPrimaryText}
                  style={{ color: appearance.onPrimary }}
                >
                  {participant ? "Save" : "Add person"}
                </AppText>
              )}
            </Pressable>
          </View>
        </>
      )}
    </BottomSheet>
  );
};

import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppText, AppTextInput } from "@/components";
import { useThemeColors } from "@/hooks";

export const GuestIdentityCard = ({
  name,
  isRenaming,
  isLeaving,
  readOnly,
  onRename,
  onLeave,
}: {
  name: string;
  isRenaming: boolean;
  isLeaving: boolean;
  readOnly: boolean;
  onRename: (name: string) => void;
  onLeave: () => void;
}) => {
  const colors = useThemeColors();
  const [draftName, setDraftName] = useState(name);
  const [editing, setEditing] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => setDraftName(name), [name]);
  useEffect(() => {
    if (!readOnly) return;
    setEditing(false);
    setConfirmingLeave(false);
  }, [readOnly]);

  const handleSave = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setFieldError("Enter a name.");
      return;
    }

    setFieldError(null);
    onRename(trimmedName);
    setEditing(false);
  };

  if (confirmingLeave) {
    return (
      <View className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900 dark:bg-red-950/30">
        <AppText className="text-base font-bold text-red-800 dark:text-red-200">
          Leave this bill room?
        </AppText>
        <AppText className="mt-1 text-sm leading-5 text-red-700 dark:text-red-300">
          Your claims will be removed and shared items will be recalculated.
        </AppText>
        <View className="mt-4 flex-row gap-2">
          <Pressable
            className="flex-1 items-center rounded-xl border border-red-300 px-4 py-3 active:opacity-70 dark:border-red-800"
            disabled={isLeaving}
            onPress={() => setConfirmingLeave(false)}
          >
            <AppText className="font-semibold text-red-800 dark:text-red-200">
              Stay
            </AppText>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-xl bg-red-700 px-4 py-3 active:opacity-70"
            disabled={isLeaving}
            onPress={onLeave}
          >
            {isLeaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <AppText className="font-semibold text-white">Leave room</AppText>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-5 rounded-2xl border border-borderSubtle bg-background px-5 py-4">
      {editing ? (
        <>
          <AppText className="mb-2 text-sm font-semibold text-foreground">
            Your name
          </AppText>
          <AppTextInput
            accessibilityLabel="Update your guest name"
            autoCapitalize="words"
            className="rounded-xl border border-borderSubtle bg-stone-50 px-4 py-3 text-base text-foreground dark:bg-neutral-900"
            maxLength={80}
            placeholderTextColor={colors.muted}
            value={draftName}
            onChangeText={setDraftName}
            onSubmitEditing={handleSave}
          />
          {fieldError ? (
            <AppText className="mt-2 text-sm text-red-600">
              {fieldError}
            </AppText>
          ) : null}
          <View className="mt-3 flex-row gap-2">
            <Pressable
              className="flex-1 items-center rounded-xl border border-borderSubtle px-4 py-3 active:opacity-70"
              disabled={isRenaming}
              onPress={() => {
                setDraftName(name);
                setFieldError(null);
                setEditing(false);
              }}
            >
              <AppText className="font-semibold text-foreground">
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-xl bg-foreground px-4 py-3 active:opacity-70"
              disabled={isRenaming}
              onPress={handleSave}
            >
              {isRenaming ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <AppText className="font-semibold text-background">
                  Save name
                </AppText>
              )}
            </Pressable>
          </View>
        </>
      ) : (
        <View className="flex-row items-center justify-between gap-4">
          <View className="min-w-0 flex-1">
            <AppText className="text-sm text-muted">Claiming as</AppText>
            <AppText className="mt-1 text-lg font-bold text-foreground">
              {name}
            </AppText>
          </View>
          {readOnly ? (
            <AppText className="text-xs font-semibold uppercase text-muted">
              Finalised
            </AppText>
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditing(true)}
              >
                <AppText className="font-semibold text-foreground">
                  Rename
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmingLeave(true)}
              >
                <AppText className="font-semibold text-red-600">Leave</AppText>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

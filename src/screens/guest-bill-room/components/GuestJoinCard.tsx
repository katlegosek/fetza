import { View } from "react-native";

import { AppText, AppTextInput, NativeGlassButton } from "@/components";
import { useThemeColors } from "@/hooks";

export const GuestJoinCard = ({
  name,
  error,
  isJoining,
  onChangeName,
  onJoin,
}: {
  name: string;
  error: string | null;
  isJoining: boolean;
  onChangeName: (name: string) => void;
  onJoin: () => void;
}) => {
  const colors = useThemeColors();

  return (
    <View className="rounded-3xl border border-borderSubtle bg-background p-6 shadow-sm shadow-black/10">
      <AppText className="text-2xl font-bold text-foreground">
        Join the bill
      </AppText>
      <AppText className="mt-2 text-base leading-6 text-muted">
        Enter your name, then claim the items you had. No account or app needed.
      </AppText>
      <AppText className="mb-2 mt-6 text-sm font-semibold text-foreground">
        Your name
      </AppText>
      <AppTextInput
        accessibilityLabel="Your name"
        autoCapitalize="words"
        autoComplete="name"
        className="rounded-2xl border border-borderSubtle bg-stone-50 px-4 py-4 text-base text-foreground dark:bg-neutral-900"
        maxLength={80}
        placeholder="e.g. Neo"
        placeholderTextColor={colors.muted}
        returnKeyType="go"
        value={name}
        onChangeText={onChangeName}
        onSubmitEditing={onJoin}
      />
      {error ? (
        <AppText className="mt-2 text-sm text-red-600">{error}</AppText>
      ) : null}
      <View className="mt-5">
        <NativeGlassButton
          accessibilityLabel="Join table"
          disabled={isJoining}
          label={isJoining ? "Joining…" : "Join table"}
          systemImage="person.badge.plus"
          variant="glassProminent"
          onPress={onJoin}
        />
      </View>
    </View>
  );
};

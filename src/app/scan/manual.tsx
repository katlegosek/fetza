import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText, ScreenContainer, ScreenHeader } from "@/components";

export default function ManualEntryScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        title="Manual entry"
        bottomHint="Line items and totals will plug in here — then back to Review."
        onBack={() => router.back()}
      />
      <View className="flex-1 justify-center px-6">
        <AppText className="text-center text-base leading-6 text-muted">
          Coming soon.
        </AppText>
      </View>
    </ScreenContainer>
  );
}

import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText, Button, ScreenContainer } from "@/components";

export default function ScanHubScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="justify-center gap-6 px-6">
      <View className="gap-2">
        <AppText className="text-center text-xl font-semibold text-foreground">
          Add a bill
        </AppText>
        <AppText className="text-center text-base text-muted">
          Camera scan comes later — pick how you want to start for now.
        </AppText>
      </View>
      <View className="gap-4">
        <Button
          accessibilityLabel="Manual entry"
          onPress={() => router.push("/scan/manual")}
        >
          Manual entry
        </Button>
        <Button
          accessibilityLabel="Review bill"
          className="border-2 border-foreground bg-transparent active:opacity-90"
          textClassName="text-center text-lg font-semibold text-foreground"
          onPress={() => router.push("/scan/review")}
        >
          Review bill
        </Button>
      </View>
    </ScreenContainer>
  );
}

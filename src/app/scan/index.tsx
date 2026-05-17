import { useRouter } from "expo-router";
import { View } from "react-native";

import { Button, ScreenContainer, ScreenHeader } from "@/components";

export default function ScanHubScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        title="Add a bill"
        bottomHint="Camera scan comes later — pick how you want to start for now."
        onBack={() => router.back()}
      />
      <View className="flex-1 justify-center gap-4 px-6">
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

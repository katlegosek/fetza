import { useRouter } from "expo-router";

import { AppText, Button, ScreenContainer } from "@/components";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="items-center justify-center gap-6 px-6">
      <AppText className="text-2xl font-semibold text-foreground">Home</AppText>
      <Button accessibilityLabel="Scan" onPress={() => router.push("/scan")}>
        Scan
      </Button>
    </ScreenContainer>
  );
}

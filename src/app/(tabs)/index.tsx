import { Text } from "react-native";

import { ScreenContainer } from "@/components";

export default function HomeScreen() {
  return (
    <ScreenContainer className="items-center justify-center">
      <Text className="text-lg font-medium text-foreground">Home</Text>
    </ScreenContainer>
  );
}

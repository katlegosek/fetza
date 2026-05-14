import { Text } from "react-native";

import { ScreenContainer } from "@/components";

export default function SettingsScreen() {
  return (
    <ScreenContainer className="items-center justify-center">
      <Text className="text-lg font-medium text-foreground">Settings</Text>
    </ScreenContainer>
  );
}

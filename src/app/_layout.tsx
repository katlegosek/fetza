import "../global.css";

import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { View } from "react-native";

import { useRootLayoutAppearance } from "@/hooks";
import { NAV_THEME } from "@/lib/constants";

export default function RootLayout() {
  const { scheme, rootClassName } = useRootLayoutAppearance();

  return (
    <ThemeProvider value={NAV_THEME[scheme]}>
      <View className={rootClassName}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "default",
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

import "../global.css";

import { ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { View } from "react-native";

import { queryClient } from "@/api/queryClient";
import { useRootLayoutAppearance } from "@/hooks";
import { NAV_THEME } from "@/lib/constants";

export default function RootLayout() {
  const { scheme, rootClassName } = useRootLayoutAppearance();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[scheme]}>
        <View className={rootClassName}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "default",
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="bill" />
            <Stack.Screen name="scan" />
          </Stack>
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

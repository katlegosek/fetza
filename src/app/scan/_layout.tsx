import { Stack } from "expo-router";

export default function ScanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Scan" }} />
      <Stack.Screen name="manual" options={{ title: "Manual entry" }} />
      <Stack.Screen name="review" options={{ title: "Review" }} />
    </Stack>
  );
}

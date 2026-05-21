import { Stack } from "expo-router";

export default function ScanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="manual" />
      <Stack.Screen name="review" />
      <Stack.Screen name="assign" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="share" />
    </Stack>
  );
}

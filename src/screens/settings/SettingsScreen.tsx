import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppText, Button, ScreenContainer } from "@/components";
import { useAuth } from "@/providers/auth";

export const SettingsScreen = () => {
  const router = useRouter();
  const { user, logout, isAuthEnabled } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      if (isAuthEnabled) {
        router.replace("/auth/login" as never);
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <ScreenContainer className="flex-1 px-6 py-8">
      <AppText className="mb-2 text-lg font-medium text-foreground">
        Settings
      </AppText>

      {user ? (
        <AppText className="mb-6 text-sm text-muted">{user.email}</AppText>
      ) : null}

      {isAuthEnabled ? (
        <Button onPress={() => void handleLogout()} disabled={isLoggingOut}>
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </Button>
      ) : (
        <AppText className="text-sm text-muted">
          Auth is disabled (EXPO_PUBLIC_AUTH_ENABLED=false).
        </AppText>
      )}

      {isLoggingOut ? (
        <View className="mt-4">
          <ActivityIndicator accessibilityLabel="Signing out" />
        </View>
      ) : null}
    </ScreenContainer>
  );
};

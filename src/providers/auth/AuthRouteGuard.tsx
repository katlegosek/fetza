import { useRouter, useSegments } from "expo-router";
import { type ReactNode, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/atoms";

import { useAuth } from "./AuthProvider";

export const AuthRouteGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoadingAuth, isAuthEnabled } = useAuth();

  const rootSegment = segments[0] as string | undefined;
  const inAuthGroup = rootSegment === "auth";

  useEffect(() => {
    if (!isAuthEnabled || isLoadingAuth) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      // Route exists at app/auth/login.tsx; typed routes update after Metro picks up the new file.
      router.replace("/auth/login" as never);
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace("/" as never);
    }
  }, [inAuthGroup, isAuthenticated, isAuthEnabled, isLoadingAuth, router]);

  if (isAuthEnabled && isLoadingAuth) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <ActivityIndicator accessibilityLabel="Loading session" />
        <AppText className="text-sm text-muted">Loading…</AppText>
      </View>
    );
  }

  if (isAuthEnabled && !isAuthenticated && !inAuthGroup) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <ActivityIndicator accessibilityLabel="Redirecting to sign in" />
      </View>
    );
  }

  return children;
};

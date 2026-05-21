import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

import {
  MUTATION_ERROR_FALLBACKS,
  getAuthErrorMessage,
} from "@/api/api-error-message";
import { AppText, Button, ScreenContainer } from "@/components";
import { useThemeColors } from "@/hooks";
import { useAuth } from "@/hooks/use-auth";
import { LoginFormSchema } from "@/screens/auth/auth-screen.schema";

export function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { login, isAuthEnabled } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setSubmitError(null);
    setFieldErrors({});

    const parsed = LoginFormSchema.safeParse({ email: email.trim(), password });

    if (!parsed.success) {
      const nextErrors: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password") {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    if (!isAuthEnabled) {
      setSubmitError(
        "Auth is disabled. Set EXPO_PUBLIC_AUTH_ENABLED=true when Rails auth is ready.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await login(parsed.data);
      router.replace("/");
    } catch (error) {
      setSubmitError(
        getAuthErrorMessage(error, MUTATION_ERROR_FALLBACKS.authLogin),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6"
      >
        <AppText className="mb-6 text-2xl font-semibold text-foreground">
          Sign in
        </AppText>

        <View className="gap-4">
          <View className="gap-1">
            <AppText className="text-sm text-muted">Email</AppText>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              className="rounded-xl border border-border-subtle bg-card px-4 py-3 text-base text-foreground"
              style={{ color: colors.foreground }}
            />
            {fieldErrors.email ? (
              <AppText className="text-sm text-destructive">
                {fieldErrors.email}
              </AppText>
            ) : null}
          </View>

          <View className="gap-1">
            <AppText className="text-sm text-muted">Password</AppText>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              placeholder="Password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="rounded-xl border border-border-subtle bg-card px-4 py-3 text-base text-foreground"
              style={{ color: colors.foreground }}
            />
            {fieldErrors.password ? (
              <AppText className="text-sm text-destructive">
                {fieldErrors.password}
              </AppText>
            ) : null}
          </View>

          {submitError ? (
            <AppText className="text-sm text-destructive">
              {submitError}
            </AppText>
          ) : null}

          <Button
            onPress={() => {
              void handleLogin();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>

          {isSubmitting ? (
            <ActivityIndicator accessibilityLabel="Signing in" />
          ) : null}

          {!isAuthEnabled ? (
            <Pressable
              onPress={() => {
                router.replace("/");
              }}
            >
              <AppText className="text-center text-sm text-muted">
                Continue to Home (auth disabled)
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

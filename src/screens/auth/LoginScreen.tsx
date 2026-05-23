import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";

import {
  MUTATION_ERROR_FALLBACKS,
  getAuthErrorMessage,
} from "@/api/api-error-message";
import { AppText, Button, ScreenContainer } from "@/components";
import { useThemeColors } from "@/hooks";
import { useAuth } from "@/providers/auth";
import { LoginFormSchema } from "@/screens/auth/auth-screen.schema";

const DEV_EMAIL = "dev@fetza.local";
const DEV_PASSWORD = "password123";

export const LoginScreen = () => {
  const router = useRouter();
  const colors = useThemeColors();
  const { login } = useAuth();

  const [email, setEmail] = useState(__DEV__ ? DEV_EMAIL : "");
  const [password, setPassword] = useState(__DEV__ ? DEV_PASSWORD : "");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
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
  };

  return (
    <ScreenContainer className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6"
      >
        <AppText className="mb-6 text-2xl font-semibold text-foreground">
          Sign in
        </AppText>

        {__DEV__ ? (
          <AppText className="mb-4 text-sm text-muted">
            Dev: {DEV_EMAIL} / {DEV_PASSWORD}
          </AppText>
        ) : null}

        <View className="gap-4">
          <View className="gap-1">
            <AppText className="text-sm text-muted">Email</AppText>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder={DEV_EMAIL}
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
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

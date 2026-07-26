import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";

import { AppText, ScreenContainer, ScreenHeader } from "@/components";
import {
  type ReceiptImageSource,
  pickReceiptImage,
} from "@/lib/receipt-upload";
import { parseBillId } from "@/utils/parse-bill-id";

export const ScanScreen = () => {
  const router = useRouter();
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const existingBillId = parseBillId(billIdParam);

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const scanProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanProgress, {
          duration: 2_200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(scanProgress, {
          duration: 0,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [scanProgress]);

  const handlePick = useCallback(
    async (source: ReceiptImageSource) => {
      setSelectingImage(true);
      setPermissionDenied(false);

      try {
        const imageUri = await pickReceiptImage(source);
        if (!imageUri) {
          setPermissionDenied(true);
          return;
        }

        router.push({
          pathname: "/scan/confirm",
          params: {
            mode: "processing",
            imageUri,
            ...(existingBillId > 0 ? { billId: String(existingBillId) } : {}),
          },
        });
      } finally {
        setSelectingImage(false);
      }
    },
    [existingBillId, router],
  );

  const scanLineTranslate = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 250],
  });
  const busy = selectingImage;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader
        title="Scan receipt"
        bottomHint="Keep the full receipt inside the frame."
        onBack={() => router.back()}
      />

      <View className="flex-1 gap-4 px-4 pb-5">
        {permissionDenied ? (
          <View className="rounded-2xl bg-sky-50 px-4 py-3 dark:bg-sky-950/40">
            <AppText className="text-sm text-sky-900 dark:text-sky-100">
              No image was selected. Camera or photo library access may be
              required.
            </AppText>
          </View>
        ) : null}

        <View className="min-h-[360px] flex-1 overflow-hidden rounded-[32px] bg-neutral-950">
          <View className="absolute inset-0 bg-slate-900/70" />
          <View className="absolute -left-20 top-20 size-64 rounded-full bg-cyan-500/10" />
          <View className="absolute -right-24 bottom-12 size-72 rounded-full bg-emerald-500/10" />

          <Pressable
            accessibilityLabel={`Flash ${flashEnabled ? "on" : "off"}`}
            accessibilityRole="button"
            className="absolute right-4 top-4 z-20 size-11 items-center justify-center rounded-full bg-black/45 active:opacity-75"
            onPress={() => setFlashEnabled((enabled) => !enabled)}
          >
            <Ionicons
              color={flashEnabled ? "#facc15" : "#ffffff"}
              name={flashEnabled ? "flash" : "flash-off"}
              size={21}
            />
          </Pressable>

          <View className="flex-1 items-center justify-center px-8 py-14">
            <View className="h-[300px] w-full max-w-[300px] overflow-hidden rounded-3xl border border-white/35 bg-white/[0.04]">
              <View className="absolute left-0 top-0 h-10 w-10 rounded-tl-3xl border-l-2 border-t-2 border-emerald-300" />
              <View className="absolute right-0 top-0 h-10 w-10 rounded-tr-3xl border-r-2 border-t-2 border-emerald-300" />
              <View className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-3xl border-b-2 border-l-2 border-emerald-300" />
              <View className="absolute bottom-0 right-0 h-10 w-10 rounded-br-3xl border-b-2 border-r-2 border-emerald-300" />

              <Animated.View
                className="absolute left-4 right-4 h-20"
                style={{
                  transform: [{ translateY: scanLineTranslate }],
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  borderBottomColor: "#6ee7b7",
                  borderBottomWidth: 1.5,
                }}
              />

              <View className="flex-1 items-center justify-center px-8">
                <Ionicons
                  color="rgba(255,255,255,0.38)"
                  name="receipt-outline"
                  size={58}
                />
                <AppText className="mt-3 text-center text-sm leading-5 text-white/65">
                  Position the receipt flat and avoid shadows
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row items-end justify-around px-2">
          <Pressable
            accessibilityLabel="Gallery"
            className="w-24 items-center gap-2 py-2 active:opacity-70"
            disabled={busy}
            onPress={() => void handlePick("library")}
          >
            <View className="size-12 items-center justify-center rounded-2xl border border-borderSubtle bg-background">
              <Ionicons name="images-outline" size={22} color="#1c1917" />
            </View>
            <AppText className="text-sm font-semibold text-foreground">
              Gallery
            </AppText>
          </Pressable>

          <Pressable
            accessibilityLabel="Take photo"
            className="w-28 items-center gap-2 py-1 active:opacity-75"
            disabled={busy}
            onPress={() => void handlePick("camera")}
          >
            <View className="size-[74px] items-center justify-center rounded-full border-4 border-foreground bg-background">
              <View className="size-[54px] rounded-full bg-foreground" />
            </View>
            <AppText className="text-sm font-bold text-foreground">
              Take photo
            </AppText>
          </Pressable>

          <Pressable
            accessibilityLabel="Add manually"
            className="w-24 items-center gap-2 py-2 active:opacity-70"
            disabled={busy}
            onPress={() =>
              router.push({
                pathname: "/scan/confirm",
                params: { mode: "manual" },
              })
            }
          >
            <View className="size-12 items-center justify-center rounded-2xl border border-borderSubtle bg-background">
              <Ionicons name="create-outline" size={22} color="#1c1917" />
            </View>
            <AppText className="text-sm font-semibold text-foreground">
              Add manually
            </AppText>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
};

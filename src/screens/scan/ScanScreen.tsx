import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components";
import { pickReceiptImage } from "@/lib/receipt-upload";
import { ReceiptCameraView } from "@/screens/scan/components/ReceiptCameraView";
import { ScanControlButton } from "@/screens/scan/components/ScanControlButton";
import { ScanPermissionState } from "@/screens/scan/components/ScanPermissionState";
import { parseBillId } from "@/utils/parse-bill-id";

type CaptureSource = "camera" | "gallery" | "manual";

export const ScanScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const existingBillId = parseBillId(billIdParam);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const requestedRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [selectingImage, setSelectingImage] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanNote, setScanNote] = useState<string | null>(null);

  // Auto-prompt for camera access the first time the screen opens; the button
  // in the denied/settings state covers every later attempt.
  useEffect(() => {
    if (!permission || permission.granted || requestedRef.current) return;
    if (permission.canAskAgain) {
      requestedRef.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission]);

  // Best-effort availability check (mainly for web/simulator). Native devices
  // resolve `true`; an explicit `false` routes to the fallback actions.
  useEffect(() => {
    let cancelled = false;
    CameraView.isAvailableAsync()
      .then((available) => {
        if (!cancelled) setCameraAvailable(available);
      })
      .catch(() => {
        // Leave availability optimistic; onMountError handles real failures.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBack = useCallback(() => router.back(), [router]);

  const goToProcessing = useCallback(
    (imageUri: string, source: CaptureSource) => {
      router.push({
        pathname: "/scan/confirm",
        params: {
          mode: "processing",
          source,
          imageUri,
          ...(existingBillId > 0 ? { billId: String(existingBillId) } : {}),
        },
      });
    },
    [existingBillId, router],
  );

  const goToManual = useCallback(() => {
    router.push({
      pathname: "/scan/confirm",
      params: { mode: "manual", source: "manual" },
    });
  }, [router]);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || capturing || !cameraReady) return;

    setScanNote(null);
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) {
        setScanNote("We couldn't capture that photo. Please try again.");
        return;
      }

      // TODO: When real OCR is wired, forward `photo.width`/`photo.height` and
      // consider a permanent copy via expo-file-system before upload.
      goToProcessing(photo.uri, "camera");
    } catch {
      setScanNote("Something went wrong while capturing. Please try again.");
    } finally {
      setCapturing(false);
    }
  }, [cameraReady, capturing, goToProcessing]);

  const handlePickFromLibrary = useCallback(async () => {
    if (selectingImage) return;

    setScanNote(null);
    setSelectingImage(true);
    try {
      const imageUri = await pickReceiptImage("library");
      if (!imageUri) {
        setScanNote("No image selected. Photo library access may be required.");
        return;
      }

      goToProcessing(imageUri, "gallery");
    } finally {
      setSelectingImage(false);
    }
  }, [goToProcessing, selectingImage]);

  const handleOpenSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  if (!permission) {
    return <ScanPermissionState variant="loading" onBack={handleBack} />;
  }

  if (!permission.granted) {
    return (
      <ScanPermissionState
        variant="denied"
        onBack={handleBack}
        primaryActionLabel={
          permission.canAskAgain ? "Allow camera access" : "Open settings"
        }
        onPrimaryAction={
          permission.canAskAgain
            ? () => void requestPermission()
            : handleOpenSettings
        }
        onPickLibrary={() => void handlePickFromLibrary()}
        onManual={goToManual}
      />
    );
  }

  if (!cameraAvailable) {
    return (
      <ScanPermissionState
        variant="unavailable"
        onBack={handleBack}
        onPickLibrary={() => void handlePickFromLibrary()}
        onManual={goToManual}
      />
    );
  }

  const busy = capturing || selectingImage;
  const captureDisabled = busy || !cameraReady;

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <ReceiptCameraView
        cameraRef={cameraRef}
        flashEnabled={flashEnabled}
        isCameraReady={cameraReady}
        isCapturing={capturing}
        onCameraReady={() => setCameraReady(true)}
        onMountError={() => setCameraAvailable(false)}
      />

      <View
        className="absolute inset-x-0 top-0 z-20 flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          accessibilityLabel="Close scanner"
          accessibilityRole="button"
          className="size-11 items-center justify-center rounded-full bg-black/45 active:opacity-75"
          hitSlop={8}
          onPress={handleBack}
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </Pressable>

        <Pressable
          accessibilityLabel={`Flash ${flashEnabled ? "on" : "off"}`}
          accessibilityRole="button"
          className="size-11 items-center justify-center rounded-full bg-black/45 active:opacity-75"
          hitSlop={8}
          onPress={() => setFlashEnabled((enabled) => !enabled)}
        >
          <Ionicons
            color={flashEnabled ? "#facc15" : "#ffffff"}
            name={flashEnabled ? "flash" : "flash-off"}
            size={21}
          />
        </Pressable>
      </View>

      <View
        className="absolute inset-x-0 bottom-0 z-20 items-center gap-4 px-6 pt-6"
        style={{ paddingBottom: insets.bottom + 14 }}
      >
        {scanNote ? (
          <View className="rounded-2xl bg-black/70 px-4 py-2.5">
            <AppText className="text-center text-sm text-white">
              {scanNote}
            </AppText>
          </View>
        ) : null}

        <View className="w-full flex-row items-center justify-between">
          <ScanControlButton
            icon="images-outline"
            label="Gallery"
            disabled={busy}
            onPress={() => void handlePickFromLibrary()}
          />

          <Pressable
            accessibilityLabel="Take photo"
            accessibilityRole="button"
            className="size-[78px] items-center justify-center rounded-full border-4 border-white/40 active:opacity-75"
            disabled={captureDisabled}
            style={{ opacity: captureDisabled ? 0.5 : 1 }}
            onPress={() => void handleCapture()}
          >
            <View className="size-[62px] rounded-full bg-white" />
          </Pressable>

          <ScanControlButton
            icon="create-outline"
            label="Manual"
            accessibilityLabel="Add manually"
            disabled={busy}
            onPress={goToManual}
          />
        </View>
      </View>
    </View>
  );
};

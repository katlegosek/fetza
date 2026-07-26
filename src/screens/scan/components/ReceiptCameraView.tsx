import { type CameraType, CameraView } from "expo-camera";
import type { RefObject } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppText } from "@/components";
import { ReceiptScanFrame } from "@/screens/scan/components/ReceiptScanFrame";

export type ReceiptCameraViewProps = {
  cameraRef: RefObject<CameraView | null>;
  facing?: CameraType;
  flashEnabled: boolean;
  isCameraReady: boolean;
  onCameraReady: () => void;
  onMountError?: () => void;
  isCapturing: boolean;
};

/** Full-bleed camera preview with the receipt guide, status pill, and capture overlay. */
export const ReceiptCameraView = ({
  cameraRef,
  facing = "back",
  flashEnabled,
  isCameraReady,
  onCameraReady,
  onMountError,
  isCapturing,
}: ReceiptCameraViewProps) => (
  <View className="flex-1 overflow-hidden bg-neutral-950">
    <CameraView
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      facing={facing}
      flash={flashEnabled ? "on" : "off"}
      onCameraReady={onCameraReady}
      onMountError={onMountError}
    />

    <View pointerEvents="none" className="absolute inset-0 bg-black/20" />

    <View pointerEvents="none" className="absolute inset-x-6 bottom-56 top-28">
      <ReceiptScanFrame active={isCameraReady && !isCapturing} />
    </View>

    <View
      pointerEvents="none"
      className="absolute inset-x-0 bottom-40 items-center"
    >
      <View className="rounded-full bg-black/55 px-4 py-2">
        <AppText className="text-sm font-medium text-white">
          {isCameraReady
            ? "Hold steady and capture the whole receipt"
            : "Center your receipt"}
        </AppText>
      </View>
    </View>

    {isCapturing ? (
      <View className="absolute inset-0 items-center justify-center bg-black/45">
        <ActivityIndicator color="#ffffff" size="large" />
        <AppText className="mt-3 text-sm text-white/80">Capturing…</AppText>
      </View>
    ) : null}
  </View>
);

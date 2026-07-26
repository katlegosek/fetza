import { type CameraType, CameraView } from "expo-camera";
import type { RefObject } from "react";
import { StyleSheet, View } from "react-native";

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

/** Full-bleed camera preview with the receipt guide and status pill. */
export const ReceiptCameraView = ({
  cameraRef,
  facing = "back",
  flashEnabled,
  isCameraReady,
  onCameraReady,
  onMountError,
  isCapturing,
}: ReceiptCameraViewProps) => {
  const statusLabel = isCapturing
    ? "Capturing"
    : isCameraReady
      ? "Hold steady and capture the whole receipt"
      : "Center your receipt";

  return (
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

      <View
        pointerEvents="none"
        className="absolute inset-x-6 bottom-56 top-28"
      >
        {/* Beam only runs during capture; the preview stays a clean white frame. */}
        <ReceiptScanFrame active={isCapturing} />
      </View>

      <View
        pointerEvents="none"
        className="absolute inset-x-0 bottom-40 items-center"
      >
        <View className="rounded-full bg-black/55 px-4 py-2">
          <AppText className="text-sm font-medium text-white">
            {statusLabel}
          </AppText>
        </View>
      </View>
    </View>
  );
};

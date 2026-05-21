import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { mutationErrorMessage } from "@/api/errors";
import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import {
  AppText,
  Button,
  NoticeBanner,
  ReceiptProcessingCard,
  ScreenContainer,
  ScreenHeader,
} from "@/components";
import { useReceipt, useUploadReceiptImage } from "@/hooks";
import {
  type ReceiptImageSource,
  buildReceiptUploadFormData,
  pickReceiptImage,
} from "@/lib/receipt-upload";
import { createBill } from "@/services/bills/bill.service";
import { isReceiptProcessingComplete } from "@/services/receipts/receipt.hooks";
import { parseBillId } from "@/utils/parse-bill-id";

type ScanPhase = "idle" | "uploading" | "processing" | "failed";

export default function ScanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const existingBillId = parseBillId(billIdParam);

  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [billId, setBillId] = useState(existingBillId);
  const [receiptId, setReceiptId] = useState(0);
  const [processingStepIndex, setProcessingStepIndex] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastImageUriRef = useRef<string | null>(null);
  const navigatedRef = useRef(false);

  const uploadMutation = useUploadReceiptImage();
  const { data: receiptData } = useReceipt(receiptId, {
    pollWhileProcessing: phase === "processing",
  });

  const receiptStatus = receiptData?.receipt.status;
  const processingRunStatus = receiptData?.processing_run?.status;
  const processingRunError = receiptData?.processing_run?.error_message;
  const processingComplete = isReceiptProcessingComplete(
    receiptStatus,
    processingRunStatus,
  );
  const processingFailed =
    receiptStatus === "failed" || processingRunStatus === "failed";
  const processingSucceeded =
    processingComplete &&
    (receiptStatus === "ready" ||
      receiptStatus === "confirmed" ||
      processingRunStatus === "completed");

  useEffect(() => {
    if (phase !== "processing" || receiptStatus !== "processing") {
      return;
    }

    const timer = setInterval(() => {
      setProcessingStepIndex((current) =>
        current < 3 ? current + 1 : current,
      );
    }, 1800);

    return () => clearInterval(timer);
  }, [phase, receiptStatus]);

  useEffect(() => {
    if (phase !== "processing" || navigatedRef.current) {
      return;
    }

    if (processingSucceeded) {
      navigatedRef.current = true;
      const targetBillId = receiptData?.receipt.bill_id ?? billId;

      setPhase("idle");
      setReceiptId(0);

      router.replace({
        pathname: "/scan/review",
        params: { billId: String(targetBillId) },
      });
      void invalidateBillQueries(queryClient, targetBillId);
      return;
    }

    if (processingFailed) {
      setPhase("failed");
      setReceiptId(0);
      setScanError(
        processingRunError?.trim() ||
          "We couldn't read this receipt. Try again with a clearer photo.",
      );
    }
  }, [
    billId,
    phase,
    processingFailed,
    processingRunError,
    processingSucceeded,
    queryClient,
    receiptData?.receipt.bill_id,
    router,
  ]);

  const beginUpload = useCallback(
    async (imageUri: string) => {
      setScanError(null);
      setPermissionDenied(false);
      setPhase("uploading");
      setProcessingStepIndex(0);
      navigatedRef.current = false;
      lastImageUriRef.current = imageUri;

      try {
        let targetBillId = billId;

        if (targetBillId <= 0) {
          const created = await createBill();
          targetBillId = created.bill.id;
          setBillId(targetBillId);
          await invalidateBillQueries(queryClient, targetBillId);
        }

        const response = await uploadMutation.mutateAsync({
          billId: targetBillId,
          formData: buildReceiptUploadFormData(imageUri),
        });

        setReceiptId(response.receipt.id);
        setProcessingStepIndex(1);
        setPhase("processing");
      } catch (error) {
        setPhase("failed");
        setScanError(
          mutationErrorMessage(error, "Couldn't upload receipt. Try again."),
        );
      }
    },
    [billId, queryClient, uploadMutation],
  );

  const handlePick = useCallback(
    async (source: ReceiptImageSource) => {
      const uri = await pickReceiptImage(source);
      if (!uri) {
        setPermissionDenied(true);
        return;
      }

      await beginUpload(uri);
    },
    [beginUpload],
  );

  const handleRetry = useCallback(() => {
    const uri = lastImageUriRef.current;
    if (!uri) {
      setPhase("idle");
      setScanError(null);
      setReceiptId(0);
      setProcessingStepIndex(0);
      return;
    }

    void beginUpload(uri);
  }, [beginUpload]);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setScanError(null);
    setPermissionDenied(false);
    setReceiptId(0);
    setProcessingStepIndex(0);
    navigatedRef.current = false;
    lastImageUriRef.current = null;
    if (existingBillId <= 0) {
      setBillId(0);
    }
  }, [existingBillId]);

  const isBusy = phase === "uploading" || uploadMutation.isPending;
  const showProcessing = phase === "uploading" || phase === "processing";
  const activeStepIndex = useMemo(() => {
    if (phase === "uploading") {
      return 0;
    }

    if (processingSucceeded) {
      return 3;
    }

    return processingStepIndex;
  }, [phase, processingStepIndex, processingSucceeded]);

  const rescanHint =
    existingBillId > 0
      ? "Replace the receipt image for this bill."
      : "Take a photo or choose one from your library.";

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        title="Scan receipt"
        bottomHint={rescanHint}
        onBack={() => router.back()}
      />

      <View className="flex-1 justify-center gap-4 px-6">
        {scanError ? (
          <NoticeBanner
            dismissAccessibilityLabel="Dismiss scan error"
            icon="alert-circle-outline"
            message={scanError}
            variant="sky"
            onDismiss={() => setScanError(null)}
          />
        ) : null}

        {permissionDenied ? (
          <NoticeBanner
            dismissAccessibilityLabel="Dismiss permission message"
            icon="camera-outline"
            message="Camera or photo library access is required to scan a receipt."
            variant="sky"
            onDismiss={() => setPermissionDenied(false)}
          />
        ) : null}

        {showProcessing ? (
          <ReceiptProcessingCard
            activeStepIndex={activeStepIndex}
            allComplete={processingSucceeded}
          />
        ) : phase === "failed" ? (
          <View className="gap-4">
            <ReceiptProcessingCard
              activeStepIndex={processingStepIndex}
              subtitle="Something went wrong while reading the receipt."
            />
            <Button accessibilityLabel="Try again" onPress={handleRetry}>
              Try again
            </Button>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose a different photo"
              className="items-center py-2 active:opacity-70"
              onPress={handleReset}
            >
              <AppText className="text-sm font-medium text-muted">
                Choose a different photo
              </AppText>
            </Pressable>
          </View>
        ) : (
          <>
            <Button
              accessibilityLabel="Take photo of receipt"
              disabled={isBusy}
              onPress={() => void handlePick("camera")}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="camera-outline" size={20} color="#fff" />
                <AppText className="text-lg font-semibold text-background">
                  Take photo
                </AppText>
              </View>
            </Button>

            <Button
              accessibilityLabel="Choose receipt from library"
              className="border-2 border-foreground bg-transparent active:opacity-90"
              disabled={isBusy}
              textClassName="text-center text-lg font-semibold text-foreground"
              onPress={() => void handlePick("library")}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="images-outline" size={20} color="#1c1917" />
                <AppText className="text-lg font-semibold text-foreground">
                  Choose from library
                </AppText>
              </View>
            </Button>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Manual entry"
              className="items-center py-3 active:opacity-70"
              onPress={() => router.push("/scan/manual")}
            >
              <AppText className="text-sm font-medium text-muted">
                Manual entry instead
              </AppText>
            </Pressable>

            {/* TODO(production): Remove dev mock review entry — docs/DEV_ONLY_TODOS.md */}
            {__DEV__ ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open review without scanning"
                className="items-center py-2 active:opacity-70"
                onPress={() => router.push("/scan/review")}
              >
                <AppText className="text-xs text-muted">
                  Dev: mock review
                </AppText>
              </Pressable>
            ) : null}
          </>
        )}

        {isBusy ? (
          <View className="items-center gap-2 pt-2">
            <ActivityIndicator accessibilityLabel="Uploading receipt" />
            <AppText className="text-sm text-muted">Uploading…</AppText>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

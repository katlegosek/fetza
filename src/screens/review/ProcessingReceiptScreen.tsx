import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";

import {
  MUTATION_ERROR_FALLBACKS,
  getApiErrorMessage,
} from "@/api/api-error-message";
import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import {
  AppText,
  NoticeBanner,
  RECEIPT_ZIGZAG_DEPTH,
  ScreenContainer,
  ScreenHeader,
} from "@/components";
import { buildReceiptUploadFormData } from "@/lib/receipt-upload";
import { ReviewApiScreen } from "@/screens/review/ReviewApiScreen";
import { ProcessingReceipt } from "@/screens/review/components/processing-receipt";
import { useReceiptProcessingDemo } from "@/screens/review/hooks/useReceiptProcessingDemo";
import { reviewReceiptWidth } from "@/screens/review/review.helpers";
import billService from "@/services/bills/bill.service";
import {
  isReceiptProcessingComplete,
  useReceipt,
  useUploadReceiptImage,
} from "@/services/receipts/receipt.hooks";

export const ProcessingReceiptScreen = ({
  billId,
  receiptId,
  imageUri,
}: {
  billId: number;
  receiptId: number;
  imageUri?: string;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const receiptWidth = reviewReceiptWidth(width);
  const demo = useReceiptProcessingDemo();
  const uploadReceiptImage = useUploadReceiptImage();
  const uploadStartedRef = useRef(false);
  const [resolvedBillId, setResolvedBillId] = useState(billId);
  const [resolvedReceiptId, setResolvedReceiptId] = useState(receiptId);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const receiptQuery = useReceipt(resolvedReceiptId, {
    pollWhileProcessing: true,
  });

  const uploadSelectedImage = useCallback(async () => {
    if (!imageUri) return;

    setUploadError(null);

    try {
      let targetBillId = resolvedBillId;
      if (targetBillId <= 0) {
        const created = await billService.createBill();
        targetBillId = created.bill.id;
        setResolvedBillId(targetBillId);
      }

      const response = await uploadReceiptImage.mutateAsync({
        billId: targetBillId,
        formData: buildReceiptUploadFormData(imageUri),
      });

      setResolvedReceiptId(response.receipt.id);
      await invalidateBillQueries(queryClient, targetBillId);
    } catch (error) {
      setUploadError(
        getApiErrorMessage(error, MUTATION_ERROR_FALLBACKS.scanUploadReceipt),
      );
    }
  }, [imageUri, queryClient, resolvedBillId, uploadReceiptImage]);

  useEffect(() => {
    if (!imageUri || receiptId > 0 || uploadStartedRef.current) return;

    uploadStartedRef.current = true;
    void uploadSelectedImage();
  }, [imageUri, receiptId, uploadSelectedImage]);

  const receiptStatus = receiptQuery.data?.receipt.status;
  const processingRunStatus = receiptQuery.data?.processing_run?.status;
  const backendComplete = isReceiptProcessingComplete(
    receiptStatus,
    processingRunStatus,
  );
  const backendSucceeded =
    backendComplete &&
    (receiptStatus === "ready" ||
      receiptStatus === "confirmed" ||
      processingRunStatus === "completed");
  const backendFailed =
    receiptStatus === "failed" ||
    processingRunStatus === "failed" ||
    receiptQuery.isError ||
    uploadError !== null;

  if (demo.isComplete && backendSucceeded && resolvedBillId > 0) {
    return <ReviewApiScreen billId={resolvedBillId} />;
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader title="Receipt" onBack={() => router.back()} />

      <View className="px-5 pb-3 pt-1">
        <AppText className="text-center text-2xl font-bold text-foreground">
          {demo.currentStage.heading}
        </AppText>
        <AppText className="mt-1 text-center text-sm text-muted">
          Turning your receipt into a shared bill ✨
        </AppText>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 18 + RECEIPT_ZIGZAG_DEPTH,
          paddingBottom: 32 + RECEIPT_ZIGZAG_DEPTH,
        }}
        showsVerticalScrollIndicator={false}
      >
        {backendFailed ? (
          <NoticeBanner
            className="mb-5"
            dismissAccessibilityLabel="Dismiss receipt processing error"
            icon="alert-circle-outline"
            message={
              uploadError ??
              receiptQuery.data?.processing_run?.error_message ??
              "We couldn't finish reading this receipt. Go back and try another photo."
            }
            style={{ width: receiptWidth }}
            variant="sky"
            onDismiss={() => {
              if (uploadError) {
                void uploadSelectedImage();
                return;
              }

              void receiptQuery.refetch();
            }}
          />
        ) : null}

        <ProcessingReceipt
          discoveryPill={demo.discoveryPill}
          processing={!demo.isComplete || !backendSucceeded}
          receipt={demo.receipt}
          visibility={demo.visibleReceiptData}
          width={receiptWidth}
        />

        {uploadError ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 rounded-2xl bg-foreground px-5 py-3 active:opacity-80"
            disabled={uploadReceiptImage.isPending}
            onPress={() => void uploadSelectedImage()}
          >
            <AppText className="font-semibold text-background">
              Try upload again
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
};

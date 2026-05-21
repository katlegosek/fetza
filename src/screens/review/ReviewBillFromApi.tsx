import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  createReceiptAdjustment,
  createReceiptItem,
  deleteReceiptAdjustment,
  deleteReceiptItem,
  updateReceiptAdjustment,
  updateReceiptItem,
} from "@/api/billApi";
import { isApiError, mutationErrorMessage } from "@/api/errors";
import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import {
  AppText,
  Button,
  ClearReceiptSheet,
  NoticeBanner,
  RECEIPT_ZIGZAG_DEPTH,
  type ReviewAdjustmentSavePayload,
  ReviewAdjustmentSheet,
  type ReviewItemSavePayload,
  ReviewItemSheet,
  ReviewMerchantSheet,
  ReviewOverflowMenu,
  ReviewTotalsSheet,
  ScreenContainer,
  ScreenHeader,
  ThermalReceipt,
  defaultAffectsTotalForKind,
} from "@/components";
import { useBill, usePullToRefresh, useThemeColors } from "@/hooks";
import { billShowToReceiptView } from "@/utils/bill-to-draft";
import { formatMoneyFromCents } from "@/utils/money";

import { ReviewBottomBar } from "@/screens/review/ReviewBottomBar";
import { ReviewErrorState } from "@/screens/review/ReviewErrorState";
import { ReviewLoadingState } from "@/screens/review/ReviewLoadingState";
import {
  NEW_RECEIPT_ADJUSTMENT_ID,
  NEW_RECEIPT_ITEM_ID,
  type SheetState,
} from "@/screens/review/review.constants";
import {
  notConnectedYet,
  reviewFloatingActionScrollClearance,
  reviewOverflowMenuTop,
  reviewReceiptWidth,
} from "@/screens/review/review.helpers";

export type ReviewBillFromApiProps = {
  billId: number;
};

export const ReviewBillFromApi = ({ billId }: ReviewBillFromApiProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const receiptWidth = reviewReceiptWidth(width);

  const { data, isLoading, isError, error, refetch } = useBill(billId);
  const { refreshing: pullRefreshing, onRefresh: onPullRefresh } =
    usePullToRefresh(refetch);

  const [showReviewTip, setShowReviewTip] = useState(true);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [clearReceiptOpen, setClearReceiptOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [adjustmentSaving, setAdjustmentSaving] = useState(false);
  const [reviewActionError, setReviewActionError] = useState<string | null>(
    null,
  );

  const overflowMenuTop = reviewOverflowMenuTop(insets.top);
  const closeSheet = useCallback(() => setSheet(null), []);

  const receiptId = data?.receipt?.id;

  const nextAdjustmentPosition = useMemo(() => {
    const adjustments = data?.receipt_adjustments ?? [];
    if (adjustments.length === 0) return 0;
    return Math.max(...adjustments.map((row) => row.position)) + 1;
  }, [data?.receipt_adjustments]);

  const handleAddLine = useCallback(() => {
    setSheet({ kind: "line", lineId: NEW_RECEIPT_ITEM_ID });
  }, []);

  const handleSaveItem = useCallback(
    async (next: ReviewItemSavePayload) => {
      if (sheet?.kind !== "line") return;

      setItemSaving(true);
      try {
        const name = next.description.trim() || "New item";

        if (sheet.lineId === NEW_RECEIPT_ITEM_ID) {
          await createReceiptItem(billId, {
            name,
            quantity: next.qty,
            total_cents: next.amountCents,
          });
        } else {
          const receiptItemId = Number(sheet.lineId);
          if (!Number.isFinite(receiptItemId)) {
            throw new Error("Invalid receipt item.");
          }

          await updateReceiptItem(receiptItemId, {
            name,
            quantity: next.qty,
            total_cents: next.amountCents,
          });
        }

        await invalidateBillQueries(queryClient, billId);
      } catch (saveError) {
        setReviewActionError(
          mutationErrorMessage(
            saveError,
            "Couldn't save item. Please try again.",
          ),
        );
        throw saveError;
      } finally {
        setItemSaving(false);
      }
    },
    [billId, queryClient, sheet],
  );

  const handleDeleteItem = useCallback(async () => {
    if (sheet?.kind !== "line" || sheet.lineId === NEW_RECEIPT_ITEM_ID) {
      return;
    }

    const receiptItemId = Number(sheet.lineId);
    if (!Number.isFinite(receiptItemId)) {
      return;
    }

    setItemSaving(true);
    try {
      await deleteReceiptItem(receiptItemId);
      await invalidateBillQueries(queryClient, billId);
    } catch (deleteError) {
      setReviewActionError(
        mutationErrorMessage(
          deleteError,
          "Couldn't remove item. Please try again.",
        ),
      );
      throw deleteError;
    } finally {
      setItemSaving(false);
    }
  }, [billId, queryClient, sheet]);

  const openAddAdjustment = useCallback(() => {
    if (!receiptId) {
      setReviewActionError("This bill has no receipt to edit yet.");
      return;
    }
    setReviewActionError(null);
    setSheet({ kind: "adjustment", adjustmentId: NEW_RECEIPT_ADJUSTMENT_ID });
  }, [receiptId]);

  const handleSaveAdjustment = useCallback(
    async (next: ReviewAdjustmentSavePayload) => {
      if (sheet?.kind !== "adjustment" || !receiptId) return;

      setAdjustmentSaving(true);
      setReviewActionError(null);

      try {
        const payload = {
          label: next.label,
          kind: next.kind,
          amount_cents: next.amountCents,
          affects_total: next.affectsTotal,
        };

        if (sheet.adjustmentId === NEW_RECEIPT_ADJUSTMENT_ID) {
          await createReceiptAdjustment(receiptId, {
            ...payload,
            position: nextAdjustmentPosition,
          });
        } else {
          const adjustmentId = Number(sheet.adjustmentId);
          if (!Number.isFinite(adjustmentId)) {
            throw new Error("Invalid receipt adjustment.");
          }

          const existing = data?.receipt_adjustments.find(
            (row) => row.id === adjustmentId,
          );

          await updateReceiptAdjustment(adjustmentId, {
            ...payload,
            position: existing?.position,
          });
        }

        await invalidateBillQueries(queryClient, billId);
      } catch (saveError) {
        setReviewActionError(
          mutationErrorMessage(saveError, "Couldn't save fee or tax."),
        );
        throw saveError;
      } finally {
        setAdjustmentSaving(false);
      }
    },
    [
      billId,
      data?.receipt_adjustments,
      nextAdjustmentPosition,
      queryClient,
      receiptId,
      sheet,
    ],
  );

  const handleDeleteAdjustment = useCallback(async () => {
    if (
      sheet?.kind !== "adjustment" ||
      sheet.adjustmentId === NEW_RECEIPT_ADJUSTMENT_ID
    ) {
      return;
    }

    const adjustmentId = Number(sheet.adjustmentId);
    if (!Number.isFinite(adjustmentId)) {
      return;
    }

    setAdjustmentSaving(true);
    setReviewActionError(null);

    try {
      await deleteReceiptAdjustment(adjustmentId);
      await invalidateBillQueries(queryClient, billId);
    } catch (deleteError) {
      setReviewActionError(
        mutationErrorMessage(deleteError, "Couldn't remove fee or tax."),
      );
      throw deleteError;
    } finally {
      setAdjustmentSaving(false);
    }
  }, [billId, queryClient, sheet]);

  const receiptView = useMemo(
    () => (data ? billShowToReceiptView(data) : null),
    [data],
  );

  const draft = receiptView?.draft;
  const feeRows = receiptView?.feeRows ?? [];
  const subtotalCents = receiptView?.subtotalCents ?? 0;
  const totalCents = receiptView?.totalCents ?? 0;
  const itemCount = draft?.lines.length ?? 0;
  const receiptItemCount = data?.receipt_items.length ?? 0;

  const activeLine =
    sheet?.kind === "line"
      ? sheet.lineId === NEW_RECEIPT_ITEM_ID
        ? {
            id: NEW_RECEIPT_ITEM_ID,
            qty: 1,
            description: "",
            amountCents: 0,
          }
        : draft?.lines.find((line) => line.id === sheet.lineId)
      : undefined;

  const isNewItemSheet =
    sheet?.kind === "line" && sheet.lineId === NEW_RECEIPT_ITEM_ID;

  const isNewAdjustmentSheet =
    sheet?.kind === "adjustment" &&
    sheet.adjustmentId === NEW_RECEIPT_ADJUSTMENT_ID;

  const activeAdjustment =
    sheet?.kind === "adjustment"
      ? isNewAdjustmentSheet
        ? {
            label: "",
            kind: "tax" as const,
            amountCents: 0,
            affectsTotal: defaultAffectsTotalForKind("tax"),
          }
        : (() => {
            const row = data?.receipt_adjustments.find(
              (adjustment) => String(adjustment.id) === sheet.adjustmentId,
            );
            if (!row) return undefined;
            return {
              label: row.label,
              kind: row.kind,
              amountCents: row.amount_cents,
              affectsTotal: row.affects_total,
            };
          })()
      : undefined;

  const adjustmentCount = data?.receipt_adjustments.length ?? 0;

  const floatingActionScrollClearance = reviewFloatingActionScrollClearance(
    insets.bottom,
  );
  const headerTitle = data?.bill.title ?? "Review";

  if (isLoading) {
    return (
      <ReviewLoadingState title={headerTitle} onBack={() => router.back()} />
    );
  }

  if (isError) {
    const message = isApiError(error)
      ? error.message
      : "Something went wrong loading this receipt.";

    return (
      <ReviewErrorState
        message={message}
        title={headerTitle}
        onBack={() => router.back()}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data || !draft) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScreenHeader title={headerTitle} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-6">
          <AppText className="text-center text-sm text-muted">
            No receipt data for this bill.
          </AppText>
          <Button className="mt-6 w-full" onPress={() => router.back()}>
            Go back
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  const showEmptyItemsHint = itemCount === 0;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader
        title={data.bill.title}
        topHint={data.bill.status}
        rightSlot={
          <Pressable
            accessibilityLabel="More options"
            className="h-10 w-10 items-center justify-center rounded-full border border-borderSubtle bg-white active:opacity-85 dark:bg-background"
            hitSlop={10}
            onPress={() => setOverflowMenuOpen(true)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={colors.foreground}
            />
          </Pressable>
        }
        onBack={() => router.back()}
      />
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            alignItems: "center",
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 12 + RECEIPT_ZIGZAG_DEPTH,
            paddingBottom:
              16 + RECEIPT_ZIGZAG_DEPTH + floatingActionScrollClearance,
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={onPullRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {showReviewTip ? (
            <NoticeBanner
              className="mb-6 self-center"
              dismissAccessibilityLabel="Dismiss tip"
              icon="cloud-outline"
              message="Tap lines or fees to edit · Add item or Add fee / tax on the slip"
              style={{ width: receiptWidth }}
              variant="violet"
              onDismiss={() => setShowReviewTip(false)}
            />
          ) : null}

          {reviewActionError ? (
            <NoticeBanner
              className="mb-4 self-center"
              dismissAccessibilityLabel="Dismiss error"
              icon="alert-circle-outline"
              message={reviewActionError}
              style={{ width: receiptWidth }}
              variant="sky"
              onDismiss={() => setReviewActionError(null)}
            />
          ) : null}

          {showEmptyItemsHint ? (
            <AppText
              className="mb-4 text-center text-sm text-muted"
              style={{ width: receiptWidth }}
            >
              No receipt lines yet. Tap Add item on the slip below.
            </AppText>
          ) : null}

          <ThermalReceipt
            draft={draft}
            feeRows={feeRows}
            formatAmount={formatMoneyFromCents}
            subtotalCents={subtotalCents}
            totalCents={totalCents}
            width={receiptWidth}
            onAddAdjustment={openAddAdjustment}
            onAddLine={handleAddLine}
            onFeeRowPress={(adjustmentId) =>
              setSheet({ kind: "adjustment", adjustmentId })
            }
            onLinePress={(lineId) => setSheet({ kind: "line", lineId })}
            onMerchantPress={notConnectedYet}
            onTotalsPress={openAddAdjustment}
          />
        </ScrollView>

        <ReviewBottomBar
          bottomInset={insets.bottom}
          itemCountLabel={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          totalDisplay={formatMoneyFromCents(totalCents)}
          onAssignPress={() =>
            router.push({
              pathname: "/scan/assign",
              params: { billId: String(billId) },
            })
          }
        />
      </View>

      <ReviewMerchantSheet
        bottomInset={insets.bottom}
        merchant={draft.merchant}
        visible={sheet?.kind === "merchant"}
        onClose={closeSheet}
        onSave={notConnectedYet}
      />

      <ReviewTotalsSheet
        bottomInset={insets.bottom}
        serviceFeeCents={draft.serviceFeeCents}
        subtotalCents={subtotalCents}
        vatCents={draft.vatCents}
        visible={sheet?.kind === "totals"}
        onClose={closeSheet}
        onSave={notConnectedYet}
      />

      <ReviewOverflowMenu
        top={overflowMenuTop}
        visible={overflowMenuOpen}
        onClearReceipt={() => setClearReceiptOpen(true)}
        onClose={() => setOverflowMenuOpen(false)}
        onHelp={() =>
          Alert.alert(
            "Help",
            "Tap any line or fee on the receipt to edit it. Use Add fee / tax for VAT, service charge, tip, or discount. Merchant and scanning will be available in a later update.",
          )
        }
        onRescan={() =>
          router.replace({
            pathname: "/scan",
            params: { billId: String(billId) },
          })
        }
        onViewOriginal={() =>
          Alert.alert(
            "View original receipt",
            "The camera image will appear here once receipt scanning is available.",
          )
        }
      />

      <ClearReceiptSheet
        bottomInset={insets.bottom}
        visible={clearReceiptOpen}
        onClose={() => setClearReceiptOpen(false)}
        onConfirmClear={() => {
          setClearReceiptOpen(false);
          notConnectedYet();
        }}
      />

      <ReviewItemSheet
        amountCents={activeLine?.amountCents ?? 0}
        canDelete={
          !isNewItemSheet && receiptItemCount > 1 && activeLine !== undefined
        }
        isNewItem={isNewItemSheet}
        isSaving={itemSaving}
        itemDescription={activeLine?.description ?? ""}
        quantity={activeLine?.qty ?? 1}
        visible={sheet?.kind === "line" && activeLine !== undefined}
        bottomInset={insets.bottom}
        onClose={closeSheet}
        onDelete={handleDeleteItem}
        onSave={handleSaveItem}
      />

      <ReviewAdjustmentSheet
        affectsTotal={activeAdjustment?.affectsTotal ?? true}
        amountCents={activeAdjustment?.amountCents ?? 0}
        canDelete={!isNewAdjustmentSheet && adjustmentCount > 0}
        isNew={isNewAdjustmentSheet}
        isSaving={adjustmentSaving}
        kind={activeAdjustment?.kind ?? "tax"}
        label={activeAdjustment?.label ?? ""}
        visible={sheet?.kind === "adjustment" && activeAdjustment !== undefined}
        bottomInset={insets.bottom}
        onClose={closeSheet}
        onDelete={handleDeleteAdjustment}
        onSave={handleSaveAdjustment}
      />
    </ScreenContainer>
  );
};

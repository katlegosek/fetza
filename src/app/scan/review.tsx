import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { isApiError } from "@/api/errors";
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
  type SaveBillFees,
  ScreenContainer,
  ScreenHeader,
  ThermalReceipt,
  defaultAffectsTotalForKind,
} from "@/components";
import { useBill, usePullToRefresh, useThemeColors } from "@/hooks";
import {
  cloneBillDraft,
  formatZAR,
  generateLineId,
  sumLineAmountsCents,
} from "@/lib/helper";
import {
  type DraftBill,
  MOCK_DRAFT_BILL,
  type ReceiptLine,
} from "@/mocks/review-draft.mock";
import { billShowToReceiptView } from "@/utils/bill-to-draft";
import { formatMoneyFromCents } from "@/utils/money";

type SheetState =
  | { kind: "line"; lineId: string }
  | { kind: "merchant" }
  | { kind: "totals" }
  | { kind: "adjustment"; adjustmentId: string }
  | null;

function parseBillId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function notConnectedYet() {
  Alert.alert(
    "Coming soon",
    "Editing receipts is not connected to the server yet.",
  );
}

const NEW_RECEIPT_ITEM_ID = "__new__";
const NEW_RECEIPT_ADJUSTMENT_ID = "__new_adj__";

function mutationErrorMessage(error: unknown, fallback: string): string {
  return isApiError(error) ? error.message : fallback;
}

function ReviewBillMock() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const receiptWidth = Math.min(352, width - 32);

  const [draft, setDraft] = useState<DraftBill>(() =>
    cloneBillDraft(MOCK_DRAFT_BILL),
  );
  const [sheet, setSheet] = useState<SheetState>(null);
  const [showReviewTip, setShowReviewTip] = useState(true);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [clearReceiptOpen, setClearReceiptOpen] = useState(false);
  const [pendingNewLineId, setPendingNewLineId] = useState<string | null>(null);

  const overflowMenuTop = insets.top + 60;

  const closeSheet = useCallback(() => {
    setSheet(null);
    setPendingNewLineId(null);
  }, []);

  const saveLine = useCallback((lineId: string, next: ReceiptLine) => {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l) => (l.id === lineId ? next : l)),
    }));
  }, []);

  const deleteLine = useCallback((lineId: string) => {
    setDraft((d) => {
      if (d.lines.length <= 1) return d;
      return { ...d, lines: d.lines.filter((l) => l.id !== lineId) };
    });
  }, []);

  const handleAddLine = useCallback(() => {
    setDraft((d) => {
      const id = generateLineId();
      setPendingNewLineId(id);
      const nextLines = [
        ...d.lines,
        {
          id,
          qty: 1,
          description: "New item",
          amountCents: 0,
        },
      ];
      requestAnimationFrame(() => setSheet({ kind: "line", lineId: id }));
      return { ...d, lines: nextLines };
    });
  }, []);

  const saveMerchant = useCallback((name: string) => {
    setDraft((d) => ({ ...d, merchant: name }));
  }, []);

  const saveBillFees = useCallback((next: SaveBillFees) => {
    setDraft((d) => ({
      ...d,
      vatCents: next.vatCents,
      serviceFeeCents: next.serviceFeeCents,
    }));
  }, []);

  const confirmClearReceipt = useCallback(() => {
    setDraft({
      merchant: "",
      billId: `draft-${Date.now()}`,
      timestamp: "",
      lines: [
        {
          id: generateLineId(),
          qty: 1,
          description: "",
          amountCents: 0,
        },
      ],
      vatCents: 0,
      serviceFeeCents: 0,
    });
  }, []);

  const linesSubtotalCents = useMemo(
    () => sumLineAmountsCents(draft.lines),
    [draft.lines],
  );

  const billTotalCents = useMemo(
    () => linesSubtotalCents + draft.vatCents + draft.serviceFeeCents,
    [linesSubtotalCents, draft.vatCents, draft.serviceFeeCents],
  );

  const activeLine =
    sheet?.kind === "line"
      ? draft.lines.find((l) => l.id === sheet.lineId)
      : undefined;

  const floatingActionScrollClearance = insets.bottom + 72;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScreenHeader
        title="Review"
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
            flexGrow: 0,
            paddingHorizontal: 16,
            paddingTop: 12 + RECEIPT_ZIGZAG_DEPTH,
            paddingBottom:
              16 + RECEIPT_ZIGZAG_DEPTH + floatingActionScrollClearance,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showReviewTip ? (
            <NoticeBanner
              className="mb-6 self-center"
              dismissAccessibilityLabel="Dismiss tip"
              icon="hand-left-outline"
              message="Tap any line to fix · Totals update automatically"
              style={{ width: receiptWidth }}
              variant="violet"
              onDismiss={() => setShowReviewTip(false)}
            />
          ) : null}
          <ThermalReceipt
            draft={draft}
            onAddLine={handleAddLine}
            onLinePress={(lineId) => setSheet({ kind: "line", lineId })}
            onMerchantPress={() => setSheet({ kind: "merchant" })}
            onTotalsPress={() => setSheet({ kind: "totals" })}
            width={receiptWidth}
          />
        </ScrollView>

        <View
          pointerEvents="box-none"
          className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-0"
          style={{
            backgroundColor: "transparent",
            paddingBottom: insets.bottom,
          }}
        >
          <View className="flex-row items-stretch gap-2 rounded-2xl border border-borderSubtle bg-background px-3 py-3 shadow-lg shadow-black/20">
            <View className="min-w-0 flex-1 basis-0 flex-row items-center pr-1.5">
              <View
                className="size-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.borderSubtle }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={colors.foreground}
                />
              </View>
              <View className="min-w-0 justify-center pl-2">
                <AppText className="text-[11px] leading-tight text-muted">
                  Total
                </AppText>
                <AppText className="mt-0.5 text-xl font-bold tabular-nums leading-tight text-foreground">
                  {formatZAR(billTotalCents)}
                </AppText>
                <AppText className="mt-0.5 text-[11px] leading-tight text-muted">
                  {draft.lines.length} items detected
                </AppText>
              </View>
            </View>

            <View className="min-w-0 flex-1 basis-0 self-stretch pl-1.5">
              <Button
                accessibilityLabel="Assign items"
                className="h-full w-full min-w-0 self-stretch flex-row items-center justify-center gap-1 rounded-xl px-3 py-0"
                onPress={() =>
                  router.push({
                    pathname: "/scan/assign",
                    params: { draft: JSON.stringify(draft) },
                  })
                }
              >
                <AppText className="text-base font-semibold text-background">
                  Assign items
                </AppText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.background}
                />
              </Button>
            </View>
          </View>
        </View>
      </View>

      <ReviewMerchantSheet
        bottomInset={insets.bottom}
        merchant={draft.merchant}
        visible={sheet?.kind === "merchant"}
        onClose={closeSheet}
        onSave={saveMerchant}
      />

      <ReviewTotalsSheet
        bottomInset={insets.bottom}
        serviceFeeCents={draft.serviceFeeCents}
        subtotalCents={linesSubtotalCents}
        vatCents={draft.vatCents}
        visible={sheet?.kind === "totals"}
        onClose={closeSheet}
        onSave={saveBillFees}
      />

      <ReviewOverflowMenu
        top={overflowMenuTop}
        visible={overflowMenuOpen}
        onClearReceipt={() => setClearReceiptOpen(true)}
        onClose={() => setOverflowMenuOpen(false)}
        onHelp={() =>
          Alert.alert(
            "Help",
            "Tap any line on the receipt to edit it. Totals and tax update as you go.",
          )
        }
        onRescan={() => router.replace("/scan")}
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
        onConfirmClear={confirmClearReceipt}
      />

      <ReviewItemSheet
        amountCents={activeLine?.amountCents ?? 0}
        canDelete={draft.lines.length > 1}
        isNewItem={sheet?.kind === "line" && sheet.lineId === pendingNewLineId}
        itemDescription={activeLine?.description ?? ""}
        quantity={activeLine?.qty ?? 1}
        visible={sheet?.kind === "line" && activeLine !== undefined}
        bottomInset={insets.bottom}
        onClose={closeSheet}
        onDelete={() => {
          if (sheet?.kind === "line") deleteLine(sheet.lineId);
        }}
        onSave={(next) => {
          if (sheet?.kind === "line" && activeLine) {
            saveLine(sheet.lineId, {
              ...activeLine,
              description: next.description,
              qty: next.qty,
              amountCents: next.amountCents,
            });
            setPendingNewLineId(null);
          }
        }}
      />
    </ScreenContainer>
  );
}

function ReviewBillFromApi({ billId }: { billId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const receiptWidth = Math.min(352, width - 32);

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

  const overflowMenuTop = insets.top + 60;
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
        Alert.alert(
          "Couldn't save item",
          mutationErrorMessage(saveError, "Please try again."),
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
      Alert.alert(
        "Couldn't remove item",
        mutationErrorMessage(deleteError, "Please try again."),
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

  const floatingActionScrollClearance = insets.bottom + 72;
  const headerTitle = data?.bill.title ?? "Review";

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScreenHeader title={headerTitle} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator accessibilityLabel="Loading receipt" />
          <AppText className="text-sm text-muted">Loading receipt…</AppText>
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    const message = isApiError(error)
      ? error.message
      : "Something went wrong loading this receipt.";

    return (
      <ScreenContainer className="flex-1 bg-background">
        <ScreenHeader title={headerTitle} onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <AppText className="text-center text-sm text-foreground">
            {message}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading receipt"
            className="rounded-xl border border-borderSubtle px-4 py-2 active:opacity-70"
            onPress={() => void refetch()}
          >
            <AppText className="text-sm font-medium text-foreground">
              Try again
            </AppText>
          </Pressable>
        </View>
      </ScreenContainer>
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

        <View
          pointerEvents="box-none"
          className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-0"
          style={{
            backgroundColor: "transparent",
            paddingBottom: insets.bottom,
          }}
        >
          <View className="flex-row items-stretch gap-2 rounded-2xl border border-borderSubtle bg-background px-3 py-3 shadow-lg shadow-black/20">
            <View className="min-w-0 flex-1 basis-0 flex-row items-center pr-1.5">
              <View
                className="size-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.borderSubtle }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={colors.foreground}
                />
              </View>
              <View className="min-w-0 justify-center pl-2">
                <AppText className="text-[11px] leading-tight text-muted">
                  Total
                </AppText>
                <AppText className="mt-0.5 text-xl font-bold tabular-nums leading-tight text-foreground">
                  {formatMoneyFromCents(totalCents)}
                </AppText>
                <AppText className="mt-0.5 text-[11px] leading-tight text-muted">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </AppText>
              </View>
            </View>

            <View className="min-w-0 flex-1 basis-0 self-stretch pl-1.5">
              <Button
                accessibilityLabel="Assign items"
                className="h-full w-full min-w-0 self-stretch flex-row items-center justify-center gap-1 rounded-xl px-3 py-0"
                onPress={() =>
                  router.push({
                    pathname: "/scan/assign",
                    params: { billId: String(billId) },
                  })
                }
              >
                <AppText className="text-base font-semibold text-background">
                  Assign items
                </AppText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.background}
                />
              </Button>
            </View>
          </View>
        </View>
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
}

export default function ReviewBillScreen() {
  const { billId: billIdParam } = useLocalSearchParams<{
    billId?: string | string[];
  }>();
  const billId = parseBillId(billIdParam);

  if (billId > 0) {
    return <ReviewBillFromApi billId={billId} />;
  }

  return <ReviewBillMock />;
}

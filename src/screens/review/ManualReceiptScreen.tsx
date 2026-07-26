import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/api/api-error-message";
import { invalidateBillQueries } from "@/api/invalidate-bill-queries";
import {
  NoticeBanner,
  RECEIPT_ZIGZAG_DEPTH,
  ScreenContainer,
  ScreenHeader,
  ThermalReceipt,
} from "@/components";
import { ReviewBottomBar } from "@/screens/review/ReviewBottomBar";
import {
  type ReviewAdjustmentSavePayload,
  ReviewAdjustmentSheet,
  type ReviewItemSavePayload,
  ReviewItemSheet,
  ReviewMerchantSheet,
} from "@/screens/review/components";
import { reviewReceiptWidth } from "@/screens/review/review.helpers";
import { useConfirmBillRoom } from "@/services/bill-room";
import billService from "@/services/bills/bill.service";
import receiptService from "@/services/receipts/receipt.service";
import type { ReceiptAdjustmentKind } from "@/services/receipts/types";
import type { ReceiptLine } from "@/types/draft-bill";
import { formatMoneyFromCents } from "@/utils/money";

type ManualAdjustment = {
  id: string;
  label: string;
  kind: ReceiptAdjustmentKind;
  amountCents: number;
  affectsTotal: boolean;
};

type ManualSheet =
  | { kind: "merchant" }
  | { kind: "item"; id: string | null }
  | { kind: "adjustment"; id: string | null }
  | null;

function manualTimestamp(): string {
  return new Date().toLocaleString("en-ZA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ManualReceiptScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const receiptWidth = reviewReceiptWidth(width);
  const confirmBillRoom = useConfirmBillRoom();

  const [merchant, setMerchant] = useState("");
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [adjustments, setAdjustments] = useState<ManualAdjustment[]>([]);
  const [sheet, setSheet] = useState<ManualSheet>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const subtotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  const totalCents =
    subtotalCents +
    adjustments
      .filter((adjustment) => adjustment.affectsTotal)
      .reduce((sum, adjustment) => sum + adjustment.amountCents, 0);
  const valid =
    merchant.trim().length > 0 && lines.length > 0 && totalCents > 0;

  const activeLine =
    sheet?.kind === "item" && sheet.id
      ? lines.find((line) => line.id === sheet.id)
      : undefined;
  const activeAdjustment =
    sheet?.kind === "adjustment" && sheet.id
      ? adjustments.find((adjustment) => adjustment.id === sheet.id)
      : undefined;

  const draft = useMemo(
    () => ({
      merchant: merchant || "Add restaurant",
      billId: "MANUAL RECEIPT",
      timestamp: manualTimestamp(),
      lines,
      vatCents: 0,
      serviceFeeCents: 0,
    }),
    [lines, merchant],
  );

  const saveItem = (next: ReviewItemSavePayload) => {
    if (sheet?.kind !== "item") return;

    if (sheet.id) {
      setLines((current) =>
        current.map((line) =>
          line.id === sheet.id
            ? {
                ...line,
                description: next.description,
                qty: next.qty,
                amountCents: next.amountCents,
              }
            : line,
        ),
      );
      return;
    }

    setLines((current) => [
      ...current,
      {
        id: `manual-item-${Date.now()}`,
        description: next.description,
        qty: next.qty,
        amountCents: next.amountCents,
      },
    ]);
  };

  const saveAdjustment = (next: ReviewAdjustmentSavePayload) => {
    if (sheet?.kind !== "adjustment") return;

    if (sheet.id) {
      setAdjustments((current) =>
        current.map((adjustment) =>
          adjustment.id === sheet.id
            ? {
                ...adjustment,
                label: next.label,
                kind: next.kind,
                amountCents: next.amountCents,
                affectsTotal: next.affectsTotal,
              }
            : adjustment,
        ),
      );
      return;
    }

    setAdjustments((current) => [
      ...current,
      {
        id: `manual-adjustment-${Date.now()}`,
        label: next.label,
        kind: next.kind,
        amountCents: next.amountCents,
        affectsTotal: next.affectsTotal,
      },
    ]);
  };

  const handleConfirm = async () => {
    if (!valid || saving) return;

    setSaving(true);
    setError(null);

    try {
      const created = await billService.createBill(merchant.trim());
      const billId = created.bill.id;
      const receipt = await receiptService.createManualReceipt(billId, {
        merchant_name: merchant.trim(),
        receipt_date: new Date().toISOString().slice(0, 10),
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        currency: "ZAR",
        tax_cents: adjustments
          .filter((row) => row.kind === "tax")
          .reduce((sum, row) => sum + row.amountCents, 0),
        service_fee_cents: adjustments
          .filter((row) => row.kind === "service_fee")
          .reduce((sum, row) => sum + row.amountCents, 0),
        tip_cents: adjustments
          .filter((row) => row.kind === "tip")
          .reduce((sum, row) => sum + row.amountCents, 0),
        discount_cents: adjustments
          .filter((row) => row.kind === "discount")
          .reduce((sum, row) => sum + row.amountCents, 0),
      });

      for (const [position, line] of lines.entries()) {
        await receiptService.createReceiptItem(billId, {
          name: line.description,
          quantity: line.qty,
          unit_price_cents: Math.round(line.amountCents / line.qty),
          total_cents: line.amountCents,
          position,
        });
      }

      for (const [position, adjustment] of adjustments.entries()) {
        await receiptService.createReceiptAdjustment(receipt.receipt.id, {
          label: adjustment.label,
          kind: adjustment.kind,
          amount_cents: adjustment.amountCents,
          affects_total: adjustment.affectsTotal,
          position,
        });
      }

      await confirmBillRoom.mutateAsync(billId);
      await invalidateBillQueries(queryClient, billId);
      router.replace({
        pathname: "/scan/room",
        params: { billId: String(billId) },
      });
    } catch (saveError) {
      setError(
        getApiErrorMessage(
          saveError,
          "Couldn't create this table. Check your receipt and try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-canvas">
      <ScreenHeader
        title="Receipt"
        topHint="Manual entry"
        onBack={() => router.back()}
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 14 + RECEIPT_ZIGZAG_DEPTH,
            paddingBottom: insets.bottom + 110 + RECEIPT_ZIGZAG_DEPTH,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <NoticeBanner
              className="mb-4"
              dismissAccessibilityLabel="Dismiss manual receipt error"
              icon="alert-circle-outline"
              message={error}
              style={{ width: receiptWidth }}
              variant="sky"
              onDismiss={() => setError(null)}
            />
          ) : null}

          {showInstructions ? (
            <NoticeBanner
              className="mb-5"
              dismissAccessibilityLabel="Manual receipt instructions"
              icon="create-outline"
              message="Add a restaurant, at least one item, and any fees shown on the receipt."
              style={{ width: receiptWidth }}
              variant="violet"
              onDismiss={() => setShowInstructions(false)}
            />
          ) : null}

          <ThermalReceipt
            draft={draft}
            feeRows={adjustments}
            formatAmount={formatMoneyFromCents}
            subtotalCents={subtotalCents}
            totalCents={totalCents}
            width={receiptWidth}
            onAddAdjustment={() => setSheet({ kind: "adjustment", id: null })}
            onAddLine={() => setSheet({ kind: "item", id: null })}
            onFeeRowPress={(id) => setSheet({ kind: "adjustment", id })}
            onLinePress={(id) => setSheet({ kind: "item", id })}
            onMerchantPress={() => setSheet({ kind: "merchant" })}
            onTotalsPress={() => setSheet({ kind: "adjustment", id: null })}
          />
        </ScrollView>

        <ReviewBottomBar
          bottomInset={insets.bottom}
          disabled={!valid}
          isConfirming={saving}
          itemCountLabel={`${lines.length} ${lines.length === 1 ? "item" : "items"}`}
          totalDisplay={formatMoneyFromCents(totalCents)}
          onConfirmPress={() => void handleConfirm()}
        />
      </View>

      <ReviewMerchantSheet
        bottomInset={insets.bottom}
        merchant={merchant}
        visible={sheet?.kind === "merchant"}
        onClose={() => setSheet(null)}
        onSave={setMerchant}
      />

      <ReviewItemSheet
        amountCents={activeLine?.amountCents ?? 0}
        bottomInset={insets.bottom}
        canDelete={activeLine !== undefined}
        isNewItem={sheet?.kind === "item" && sheet.id === null}
        itemDescription={activeLine?.description ?? ""}
        quantity={activeLine?.qty ?? 1}
        visible={sheet?.kind === "item"}
        onClose={() => setSheet(null)}
        onDelete={() => {
          if (sheet?.kind === "item" && sheet.id) {
            setLines((current) =>
              current.filter((line) => line.id !== sheet.id),
            );
          }
        }}
        onSave={saveItem}
      />

      <ReviewAdjustmentSheet
        affectsTotal={activeAdjustment?.affectsTotal ?? true}
        amountCents={activeAdjustment?.amountCents ?? 0}
        bottomInset={insets.bottom}
        canDelete={activeAdjustment !== undefined}
        isNew={sheet?.kind === "adjustment" && sheet.id === null}
        kind={activeAdjustment?.kind ?? "service_fee"}
        label={activeAdjustment?.label ?? ""}
        visible={sheet?.kind === "adjustment"}
        onClose={() => setSheet(null)}
        onDelete={() => {
          if (sheet?.kind === "adjustment" && sheet.id) {
            setAdjustments((current) =>
              current.filter((adjustment) => adjustment.id !== sheet.id),
            );
          }
        }}
        onSave={saveAdjustment}
      />
    </ScreenContainer>
  );
};

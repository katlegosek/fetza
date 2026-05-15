import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  Button,
  RECEIPT_ZIGZAG_DEPTH,
  ReviewItemSheet,
  ReviewMerchantSheet,
  ReviewTotalsSheet,
  type SaveBillFees,
  ScreenContainer,
  ThermalReceipt,
} from "@/components";
import {
  cloneBillDraft,
  generateLineId,
  sumLineAmountsCents,
} from "@/lib/helper";
import {
  type DraftBill,
  MOCK_DRAFT_BILL,
  type ReceiptLine,
} from "@/mocks/review-draft.mock";

type SheetState =
  | { kind: "line"; lineId: string }
  | { kind: "merchant" }
  | { kind: "totals" }
  | null;

export default function ReviewBillScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const receiptWidth = Math.min(336, width - 36);

  const [draft, setDraft] = useState<DraftBill>(() =>
    cloneBillDraft(MOCK_DRAFT_BILL),
  );
  const [sheet, setSheet] = useState<SheetState>(null);

  const closeSheet = useCallback(() => setSheet(null), []);

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

  const linesSubtotalCents = useMemo(
    () => sumLineAmountsCents(draft.lines),
    [draft.lines],
  );

  const activeLine =
    sheet?.kind === "line"
      ? draft.lines.find((l) => l.id === sheet.lineId)
      : undefined;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 0,
          paddingHorizontal: 16,
          paddingTop: 12 + RECEIPT_ZIGZAG_DEPTH,
          paddingBottom: 24 + RECEIPT_ZIGZAG_DEPTH,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThermalReceipt
          draft={draft}
          onAddLine={handleAddLine}
          onLinePress={(lineId) => setSheet({ kind: "line", lineId })}
          onMerchantPress={() => setSheet({ kind: "merchant" })}
          onTotalsPress={() => setSheet({ kind: "totals" })}
          width={receiptWidth}
        />
      </ScrollView>

      {/* Split-style: footer in document flow (not absolute), primary + secondary in a row */}
      <View
        className="flex-row gap-3 rounded-t-3xl border-t border-borderSubtle bg-background px-4 pt-3 shadow-[0_-6px_24px_rgba(0,0,0,0.07)]"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          accessibilityLabel="Go back to capture"
          className="flex-1 border-2 border-foreground bg-transparent active:opacity-90"
          textClassName="text-center text-lg font-semibold text-foreground"
          onPress={() => router.back()}
        >
          Rescan
        </Button>
        <Button
          accessibilityLabel="Continue after reviewing receipt"
          className="flex-1"
          onPress={() => router.replace("/(tabs)" as const)}
        >
          Continue
        </Button>
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

      <ReviewItemSheet
        amountCents={activeLine?.amountCents ?? 0}
        canDelete={draft.lines.length > 1}
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
          }
        }}
      />
    </ScreenContainer>
  );
}

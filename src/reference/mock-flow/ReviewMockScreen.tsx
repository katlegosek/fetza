import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  NoticeBanner,
  RECEIPT_ZIGZAG_DEPTH,
  ScreenContainer,
  ScreenHeader,
  ThermalReceipt,
} from "@/components";
import { useThemeColors } from "@/hooks";
import { formatZAR, sumLineAmountsCents } from "@/lib/helper";
import {
  cloneBillDraft,
  generateLineId,
} from "@/reference/mock-flow/draft-bill.helpers";
import { MOCK_DRAFT_BILL } from "@/reference/mock-flow/review-draft.mock";
import type { DraftBill, ReceiptLine } from "@/types/draft-bill";

import { ReviewBottomBar } from "@/screens/review/ReviewBottomBar";
import {
  ClearReceiptSheet,
  ReviewItemSheet,
  ReviewMerchantSheet,
  ReviewOverflowMenu,
  ReviewTotalsSheet,
  type SaveBillFees,
} from "@/screens/review/components";
import type { SheetState } from "@/screens/review/review.constants";
import {
  reviewFloatingActionScrollClearance,
  reviewOverflowMenuTop,
  reviewReceiptWidth,
} from "@/screens/review/review.helpers";

/**
 * Mock fallback for local/demo flows without `billId` (draft JSON in navigation).
 * API mode is {@link ReviewApiScreen} — the primary path when `billId > 0`.
 *
 * TODO(production): Remove — require billId. See docs/DEV_ONLY_TODOS.md
 */
export const ReviewMockScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const receiptWidth = reviewReceiptWidth(width);

  const [draft, setDraft] = useState<DraftBill>(() =>
    cloneBillDraft(MOCK_DRAFT_BILL),
  );
  const [sheet, setSheet] = useState<SheetState>(null);
  const [showReviewTip, setShowReviewTip] = useState(true);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [clearReceiptOpen, setClearReceiptOpen] = useState(false);
  const [pendingNewLineId, setPendingNewLineId] = useState<string | null>(null);

  const overflowMenuTop = reviewOverflowMenuTop(insets.top);

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

  const floatingActionScrollClearance = reviewFloatingActionScrollClearance(
    insets.bottom,
  );

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

        <ReviewBottomBar
          bottomInset={insets.bottom}
          itemCountLabel={`${draft.lines.length} items detected`}
          totalDisplay={formatZAR(billTotalCents)}
          onAssignPress={() =>
            router.push({
              pathname: "/scan/assign",
              params: { draft: JSON.stringify(draft) },
            })
          }
        />
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
};

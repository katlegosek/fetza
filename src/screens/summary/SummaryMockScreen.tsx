import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/components";
import { useThemeColors } from "@/hooks";
import { appendSummarySnapshot } from "@/lib/bill-summary-snapshot-storage";
import { cloneBillDraft } from "@/mocks/draft-bill.helpers";
import { SummaryBottomActions } from "@/screens/summary/SummaryBottomActions";
import { SummaryEmptyState } from "@/screens/summary/SummaryEmptyState";
import { SummaryHeader } from "@/screens/summary/SummaryHeader";
import { SummaryParticipantList } from "@/screens/summary/SummaryParticipantList";
import { SummaryReceiptModal } from "@/screens/summary/SummaryReceiptModal";
import { SummaryTableScene } from "@/screens/summary/SummaryTableScene";
import { SummaryTotalsCard } from "@/screens/summary/SummaryTotalsCard";
import { useParticipantSettlement } from "@/screens/summary/hooks/useParticipantSettlement";
import { useSummaryData } from "@/screens/summary/hooks/useSummaryData";
import type { SummaryViewMode } from "@/screens/summary/summary.constants";
import { SUMMARY_SCROLL_PAD_BOTTOM_NAV } from "@/screens/summary/summary.constants";
import {
  isYouMember,
  parseSummaryPayload,
} from "@/screens/summary/summary.helpers";

/**
 * Mock fallback for local/demo flows without `billId` (`data` JSON payload).
 * API mode is {@link SummaryApiScreen} — redirects to `/bill/[id]` when `billId > 0`.
 *
 * TODO(production): Remove — API-only summary. See docs/DEV_ONLY_TODOS.md
 */
export type SummaryMockScreenProps = {
  dataParam?: string;
};

export const SummaryMockScreen = ({ dataParam }: SummaryMockScreenProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [viewMode, setViewMode] = useState<SummaryViewMode>("table");
  const [billReceiptOpen, setBillReceiptOpen] = useState(false);

  const settlementBillId = useMemo(() => {
    const payload = parseSummaryPayload(dataParam);
    return payload?.draft.billId ?? "";
  }, [dataParam]);

  const { settlementByMember, toggleMemberPaid } =
    useParticipantSettlement(settlementBillId);

  const {
    model,
    listMembersOrdered,
    merchantHint,
    outstandingCents,
    unpaidCount,
  } = useSummaryData(dataParam, settlementByMember);

  const handleBack = useCallback(() => router.back(), [router]);

  if (!model) {
    return <SummaryEmptyState onBack={handleBack} />;
  }

  const {
    draft,
    assignments,
    members,
    owed,
    grandTotalCents,
    tipCents,
    tipPercentLabel,
  } = model;

  const openMemberShare = useCallback(
    (memberId: string) => {
      if (!dataParam) return;
      router.push({
        pathname: "/scan/share",
        params: { data: dataParam, memberId },
      });
    },
    [router, dataParam],
  );

  const handleBottomPeople = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({
      pathname: "/scan/assign",
      params: { draft: JSON.stringify(cloneBillDraft(draft)) },
    });
  }, [router, draft]);

  const handleBottomShareSummary = useCallback(() => {
    if (!dataParam) return;
    const you = members.find((m) => isYouMember(m));
    const memberId = you?.id ?? members[0]?.id;
    if (!memberId) {
      Alert.alert("Share", "Add people to this bill first.");
      return;
    }
    openMemberShare(memberId);
  }, [dataParam, members, openMemberShare]);

  const handleBottomSave = useCallback(() => {
    if (!dataParam) return;
    void appendSummarySnapshot(dataParam).then(() => {
      Alert.alert("Saved", "Summary saved on this device.");
    });
  }, [dataParam]);

  const handleBottomDone = useCallback(() => {
    router.dismissTo("/");
  }, [router]);

  const openBillReceipt = useCallback(() => setBillReceiptOpen(true), []);
  const closeBillReceipt = useCallback(() => setBillReceiptOpen(false), []);

  return (
    <ScreenContainer className="flex-1">
      <SummaryHeader
        merchantHint={merchantHint}
        viewMode={viewMode}
        onBack={handleBack}
        onViewModeChange={setViewMode}
      />

      <View className="relative flex-1 bg-stone-50 dark:bg-neutral-950/50">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-2"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + SUMMARY_SCROLL_PAD_BOTTOM_NAV,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SummaryTotalsCard
            outstandingCents={outstandingCents}
            tipCents={tipCents}
            tipPercentLabel={tipPercentLabel}
            unpaidCount={unpaidCount}
          />

          {viewMode === "table" ? (
            <View className="mt-4 min-h-0 w-full flex-1 justify-center overflow-visible">
              <SummaryTableScene
                grandTotalCents={grandTotalCents}
                lineCount={draft.lines.length}
                members={members}
                owed={owed}
                settlement={settlementByMember}
                onListPress={() => setViewMode("list")}
                onMemberLongPress={(id) => void toggleMemberPaid(id)}
                onMemberPress={openMemberShare}
                onOpenReceipt={openBillReceipt}
              />
            </View>
          ) : (
            <SummaryParticipantList
              assignments={assignments}
              chevronColor={colors.foreground}
              draft={draft}
              grandTotalCents={grandTotalCents}
              members={listMembersOrdered}
              owed={owed}
              settlement={settlementByMember}
              onMemberLongPress={(id) => void toggleMemberPaid(id)}
              onMemberPress={openMemberShare}
              onOpenReceipt={openBillReceipt}
            />
          )}
        </ScrollView>

        <SummaryBottomActions
          iconColor={colors.foreground}
          insetsBottom={insets.bottom}
          onDone={handleBottomDone}
          onPeople={handleBottomPeople}
          onSave={handleBottomSave}
          onShareSummary={handleBottomShareSummary}
        />

        <SummaryReceiptModal
          draft={draft}
          visible={billReceiptOpen}
          onClose={closeBillReceipt}
        />
      </View>
    </ScreenContainer>
  );
};

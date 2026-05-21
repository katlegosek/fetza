import { useRouter } from "expo-router";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  NoticeBanner,
  ScreenContainer,
  ScreenErrorState,
  ScreenHeader,
  ScreenLoadingState,
} from "@/components";
import { FEEDBACK_MESSAGES } from "@/components/feedback/screen-feedback-copy";
import { BillDetailActions } from "@/screens/bill-detail/BillDetailActions";
import { BillDetailAdjustmentsSection } from "@/screens/bill-detail/BillDetailAdjustmentsSection";
import { BillDetailEmptyState } from "@/screens/bill-detail/BillDetailEmptyState";
import { BillDetailParticipantList } from "@/screens/bill-detail/BillDetailParticipantList";
import { BillDetailTotalsCard } from "@/screens/bill-detail/BillDetailTotalsCard";
import { billDetailLoadErrorMessage } from "@/screens/bill-detail/bill-detail.helpers";
import type { BillDetailScreenProps } from "@/screens/bill-detail/bill-detail.types";
import { useBillDetailData } from "@/screens/bill-detail/hooks/useBillDetailData";
import { useParticipantSettlement } from "@/screens/bill-detail/hooks/useParticipantSettlement";

/** API-only bill summary/detail (no mock fallback). Requires a valid `billId` from the route. */
export const BillDetailScreen = ({ billId }: BillDetailScreenProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    pullRefreshing,
    onPullRefresh,
    headerTitle,
  } = useBillDetailData(billId);

  const { summaryError, setSummaryError, handleToggleSettled } =
    useParticipantSettlement(billId);

  const handleBack = () => router.back();

  if (billId <= 0) {
    return <BillDetailEmptyState variant="invalid-bill" onBack={handleBack} />;
  }

  if (isLoading) {
    return (
      <ScreenLoadingState
        title={headerTitle}
        message={FEEDBACK_MESSAGES.billDetailLoading}
        onBack={handleBack}
        loadingAccessibilityLabel="Loading bill summary"
      />
    );
  }

  if (isError) {
    return (
      <ScreenErrorState
        title={headerTitle}
        message={billDetailLoadErrorMessage(error)}
        onBack={handleBack}
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  if (!data) {
    return (
      <BillDetailEmptyState
        variant="no-data"
        title={headerTitle}
        onBack={handleBack}
      />
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScreenHeader
        title={data.bill.title}
        topHint={data.bill.status}
        onBack={handleBack}
      />

      <View className="flex-1 bg-stone-50 dark:bg-neutral-950/50">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-2"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 24,
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
          {summaryError ? (
            <NoticeBanner
              className="mb-4"
              dismissAccessibilityLabel="Dismiss error"
              icon="alert-circle-outline"
              message={summaryError}
              variant="sky"
              onDismiss={() => setSummaryError(null)}
            />
          ) : null}

          <BillDetailTotalsCard summary={data} />

          <BillDetailActions
            onAssignItems={() =>
              router.push({
                pathname: "/scan/assign",
                params: { billId: String(billId) },
              })
            }
            onViewReceipt={() =>
              router.push({
                pathname: "/scan/review",
                params: { billId: String(billId) },
              })
            }
          />

          <BillDetailParticipantList
            participants={data.participants}
            onToggleSettled={handleToggleSettled}
          />

          <BillDetailAdjustmentsSection
            adjustments={data.receipt_adjustments}
          />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

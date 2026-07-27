import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import {
  AppText,
  BottomSheet,
  NativeGlassButton,
  bottomSheetFormClasses,
  useBottomSheetAppearance,
} from "@/components";

export const BillRoomFinalizeSheet = ({
  visible,
  bottomInset,
  unclaimedItems,
  isFinalizing,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  bottomInset: number;
  unclaimedItems: number;
  isFinalizing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const appearance = useBottomSheetAppearance();
  const hasUnclaimedItems = unclaimedItems > 0;

  return (
    <BottomSheet
      bottomInset={bottomInset}
      subtitle="Claims cannot be changed after the bill is finalised."
      title="Finalise this bill?"
      visible={visible}
      onClose={onClose}
    >
      <View
        className="mt-4 flex-row items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: appearance.fieldBg }}
      >
        <Ionicons
          color={hasUnclaimedItems ? "#d97706" : appearance.ink}
          name={hasUnclaimedItems ? "warning-outline" : "checkmark-circle"}
          size={24}
        />
        <View className="min-w-0 flex-1">
          <AppText className="font-bold" style={{ color: appearance.ink }}>
            {hasUnclaimedItems
              ? `${unclaimedItems} unclaimed ${unclaimedItems === 1 ? "item" : "items"}`
              : "Every item has been claimed"}
          </AppText>
          <AppText
            className="mt-1 text-sm leading-5"
            style={{ color: appearance.muted }}
          >
            {hasUnclaimedItems
              ? "You can return to the table and assign them, or finalise anyway."
              : "The bill is ready to move to the final summary."}
          </AppText>
        </View>
      </View>

      <View className={bottomSheetFormClasses.buttonRow}>
        <Pressable
          className={bottomSheetFormClasses.btnSecondary}
          disabled={isFinalizing}
          style={{ borderColor: appearance.border }}
          onPress={onClose}
        >
          <AppText
            className={bottomSheetFormClasses.btnSecondaryText}
            style={{ color: appearance.ink }}
          >
            Back to table
          </AppText>
        </Pressable>
        <NativeGlassButton
          accessibilityLabel={
            hasUnclaimedItems ? "Finalise anyway" : "Finalise bill"
          }
          className="min-w-[100px] flex-1"
          disabled={isFinalizing}
          label={
            isFinalizing
              ? "Finalising…"
              : hasUnclaimedItems
                ? "Finalise anyway"
                : "Finalise bill"
          }
          systemImage="checkmark"
          variant="glassProminent"
          onPress={onConfirm}
        />
      </View>
    </BottomSheet>
  );
};

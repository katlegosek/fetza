import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { AppText } from "@/components";

export const ReceiptDiscoveryPill = ({ label }: { label: string | null }) => {
  if (!label) return null;

  return (
    <View
      key={label}
      className="absolute -right-2 top-20 z-30 flex-row items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-md shadow-emerald-950/15"
    >
      <Ionicons name="sparkles" size={15} color="#047857" />
      <AppText className="text-xs font-bold text-emerald-800">{label}</AppText>
    </View>
  );
};

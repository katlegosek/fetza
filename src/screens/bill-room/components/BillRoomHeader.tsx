import { View } from "react-native";

import { AppText } from "@/components";
import { formatMoneyFromCents } from "@/utils/money";

export const BillRoomHeader = ({
  title,
  totalCents,
  status,
}: {
  title: string;
  totalCents: number;
  status: string;
}) => (
  <View className="rounded-3xl bg-foreground p-5">
    <AppText className="text-sm font-medium uppercase tracking-wider text-background/70">
      {status}
    </AppText>
    <AppText className="mt-2 text-2xl font-bold text-background">
      {title}
    </AppText>
    <AppText className="mt-1 text-3xl font-bold text-background">
      {formatMoneyFromCents(totalCents)}
    </AppText>
  </View>
);

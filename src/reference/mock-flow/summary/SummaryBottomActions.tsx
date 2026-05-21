import Ionicons from "@expo/vector-icons/Ionicons";
import { Fragment } from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components";

export type SummaryBottomActionsProps = {
  insetsBottom: number;
  iconColor: string;
  onPeople: () => void;
  onShareSummary: () => void;
  onSave: () => void;
  onDone: () => void;
};

export const SummaryBottomActions = ({
  insetsBottom,
  iconColor,
  onPeople,
  onShareSummary,
  onSave,
  onDone,
}: SummaryBottomActionsProps) => {
  const items = [
    {
      key: "people",
      label: "People",
      icon: "people-outline" as const,
      onPress: onPeople,
    },
    {
      key: "share",
      label: "Share",
      icon: "share-social-outline" as const,
      onPress: onShareSummary,
    },
    {
      key: "save",
      label: "Save",
      icon: "bookmark-outline" as const,
      onPress: onSave,
    },
    {
      key: "done",
      label: "Done",
      icon: "checkmark" as const,
      onPress: onDone,
    },
  ];

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-0"
      style={{ paddingBottom: insetsBottom }}
    >
      <View className="rounded-[28px] border border-stone-200/90 bg-white p-3 shadow-lg shadow-black/12 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-black/35">
        <View className="flex-row items-stretch">
          {items.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 ? (
                <View className="my-3 w-px shrink-0 self-stretch bg-stone-200 dark:bg-neutral-600" />
              ) : null}
              <Pressable
                accessibilityLabel={item.label}
                accessibilityRole="button"
                className="min-w-0 flex-1 items-center justify-center gap-1 py-3.5 active:opacity-85"
                hitSlop={4}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon} size={22} color={iconColor} />
                <AppText
                  className="px-0.5 text-center text-[9px] font-bold leading-tight text-foreground"
                  numberOfLines={2}
                >
                  {item.label}
                </AppText>
              </Pressable>
            </Fragment>
          ))}
        </View>
      </View>
    </View>
  );
};

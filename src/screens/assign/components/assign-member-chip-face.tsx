import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { AppText } from "@/components/atoms";
import { cn } from "@/lib/cn";

export type AssignMemberChipFaceProps = {
  name: string;
  initialsText: string;
  /** Legacy Tailwind bg class; ignored when `avatarBackgroundColor` is set. */
  avatarBgClassName?: string;
  avatarBackgroundColor?: string;
  avatarTextColor?: string;
  showYouRibbon?: boolean;
  /** Tighter chip for cramped layouts (e.g. Summary table view). */
  density?: "default" | "compact";
};

/**
 * Avatar + name + optional You ribbon — must stay in sync with Assign person chips.
 */
export const AssignMemberChipFace = ({
  name,
  initialsText,
  avatarBgClassName,
  avatarBackgroundColor,
  avatarTextColor,
  showYouRibbon,
  density = "default",
}: AssignMemberChipFaceProps) => {
  const compact = density === "compact";
  const useHex = avatarBackgroundColor != null;

  return (
    <>
      {useHex ? (
        <View
          className={cn(
            compact
              ? "size-9 items-center justify-center rounded-full"
              : "size-10 items-center justify-center rounded-full",
          )}
          style={{ backgroundColor: avatarBackgroundColor }}
        >
          <AppText
            className={cn("font-bold", compact ? "text-[11px]" : "text-[12px]")}
            style={{ color: avatarTextColor ?? "#FFFFFF" }}
          >
            {initialsText}
          </AppText>
        </View>
      ) : (
        <View
          className={cn(
            compact
              ? "size-9 items-center justify-center rounded-full"
              : "size-10 items-center justify-center rounded-full",
            avatarBgClassName ?? "bg-neutral-600",
          )}
        >
          <AppText
            className={cn(
              "font-bold text-white",
              compact ? "text-[11px]" : "text-[12px]",
            )}
          >
            {initialsText}
          </AppText>
        </View>
      )}
      <View
        className={cn(
          "flex-row items-center gap-1",
          compact ? "max-w-[90px]" : "max-w-[120px]",
        )}
      >
        <AppText
          className={cn(
            "font-semibold text-foreground",
            compact ? "text-[12px]" : "text-sm",
          )}
          numberOfLines={1}
        >
          {name}
        </AppText>
        {showYouRibbon ? (
          <Ionicons
            accessibilityLabel="Host"
            name="ribbon-outline"
            size={compact ? 13 : 15}
            color="#7c3aed"
          />
        ) : null}
      </View>
    </>
  );
};

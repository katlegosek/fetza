import { View } from "react-native";

import { AppText, ChatListIconAvatar, ChatListRow } from "@/components";
import { formatZAR } from "@/lib/helper";
import type { ReceiptLine } from "@/types/draft-bill";
import { getReceiptItemIcon } from "@/utils/get-receipt-item-icon";

type AssignLineLike = Pick<ReceiptLine, "qty" | "description" | "amountCents">;

export type AssignLineRowMember = {
  id: string;
  name: string;
  tone: string;
  avatarBackgroundColor: string;
  avatarTextColor: string;
};

export type AssignLineRowProps =
  | {
      variant: "assign";
      line: AssignLineLike;
      assigned: AssignLineRowMember[];
      lineHint: string;
      unassignedLabel?: string;
      formatAmount?: (cents: number) => string;
      onPress: () => void;
      index: number;
      showDivider?: boolean;
    }
  | {
      variant: "share";
      line: AssignLineLike;
      shareCents: number;
      assigneeCount: number;
      lineHint: string;
      formatAmount?: (cents: number) => string;
      onPress: () => void;
      index: number;
      showDivider?: boolean;
    };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export const AssignLineRow = (props: AssignLineRowProps) => {
  const { line, lineHint, onPress, showDivider = false } = props;
  const formatAmount = props.formatAmount ?? formatZAR;
  const qtyLabel = line.qty > 1 ? `${line.qty}× ` : "";
  const title = `${qtyLabel}${line.description}`;
  const listIcon = getReceiptItemIcon(line.description);
  const leading = <ChatListIconAvatar name={listIcon} size="md" />;

  if (props.variant === "share") {
    const { shareCents, assigneeCount } = props;
    return (
      <ChatListRow
        accessibilityHint={lineHint}
        accessibilityLabel={title}
        chevron
        leading={leading}
        preview={`Split ${assigneeCount} ${assigneeCount === 1 ? "way" : "ways"} · ${formatAmount(line.amountCents)} total`}
        showDivider={showDivider}
        size="md"
        title={title}
        titleNumberOfLines={2}
        trailingBottom={formatAmount(shareCents)}
        onPress={onPress}
      />
    );
  }

  const { assigned, unassignedLabel = "Tap to assign" } = props;
  const n = assigned.length;
  const perPersonCents = n >= 2 ? Math.round(line.amountCents / n) : 0;
  const previewText =
    n === 0
      ? unassignedLabel
      : n === 1
        ? `Assigned to ${assigned[0]?.name ?? ""}`
        : `Split ${n} ways · ${formatAmount(perPersonCents)} each`;

  const preview =
    n === 0 ? (
      <AppText
        className="text-[14px] font-medium text-orange-700 dark:text-orange-300"
        numberOfLines={1}
      >
        {previewText}
      </AppText>
    ) : (
      <View className="min-w-0 flex-row items-center gap-2">
        <View className="shrink-0 flex-row items-center">
          {assigned.slice(0, 3).map((m, i) => (
            <View
              key={m.id}
              className="size-5 items-center justify-center rounded-full border border-background"
              style={{
                backgroundColor: m.avatarBackgroundColor,
                marginLeft: i === 0 ? 0 : -6,
              }}
            >
              <AppText
                className="text-[8px] font-bold"
                style={{ color: m.avatarTextColor }}
              >
                {initials(m.name)}
              </AppText>
            </View>
          ))}
        </View>
        <AppText
          className="min-w-0 flex-1 text-[14px] text-muted"
          numberOfLines={1}
        >
          {previewText}
        </AppText>
      </View>
    );

  return (
    <ChatListRow
      accessibilityHint={lineHint}
      accessibilityLabel={title}
      chevron
      leading={leading}
      preview={preview}
      showDivider={showDivider}
      size="md"
      title={title}
      titleNumberOfLines={2}
      trailingBottom={formatAmount(line.amountCents)}
      onPress={onPress}
    />
  );
};

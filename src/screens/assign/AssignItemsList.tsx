import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, View } from "react-native";

import { AppText, NoticeBanner } from "@/components";
import { useAppColorScheme } from "@/hooks";
import { memberAssignHighlightFromTones } from "@/lib/member-assign-highlight";
import type { ReceiptLine } from "@/mocks/review-draft.mock";
import { AssignItemCard } from "@/screens/assign/AssignItemCard";
import type { AssignMember } from "@/screens/assign/assign.constants";
import type { AssignLine } from "@/screens/assign/mappers/bill-to-assign";

export type AssignItemsListProps = {
  lines: Array<AssignLine | ReceiptLine>;
  members: AssignMember[];
  memberById: Map<string, AssignMember>;
  displayAssignments: Record<string, string[]>;
  activeMemberId: string | null;
  activeAssignMember: AssignMember | null;
  assignmentError: string | null;
  formatAmount?: (cents: number) => string;
  scrollPaddingBottom: number;
  onLinePress: (line: AssignLine | ReceiptLine) => void;
  onDismissAssignmentError: () => void;
  onDismissActiveMember: () => void;
};

export const AssignItemsList = ({
  lines,
  memberById,
  displayAssignments,
  activeMemberId,
  activeAssignMember,
  assignmentError,
  formatAmount,
  scrollPaddingBottom,
  onLinePress,
  onDismissAssignmentError,
  onDismissActiveMember,
}: AssignItemsListProps) => {
  const scheme = useAppColorScheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-4 pt-3"
      contentContainerStyle={{
        paddingBottom: scrollPaddingBottom,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {assignmentError ? (
        <NoticeBanner
          dismissAccessibilityLabel="Dismiss assignment error"
          icon="alert-circle-outline"
          message={assignmentError}
          variant="sky"
          onDismiss={onDismissAssignmentError}
        />
      ) : null}

      {activeAssignMember ? (
        <NoticeBanner
          chrome={memberAssignHighlightFromTones(activeAssignMember)}
          dismissAccessibilityLabel="Stop assigning to this person"
          icon="people-outline"
          message={`Assigning to ${activeAssignMember.name} — tap items to add or remove`}
          onDismiss={onDismissActiveMember}
        />
      ) : null}

      <View className="gap-3">
        <View className="flex-row items-start gap-3">
          <View className="size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
            <Ionicons name="document-text-outline" size={22} color="#7c3aed" />
          </View>
          <View className="min-w-0 flex-1 pb-1 pt-0.5">
            <View className="flex-row items-center gap-2">
              <AppText
                className="min-w-0 flex-1 text-lg font-bold tracking-tight text-foreground"
                numberOfLines={1}
              >
                Items to assign
              </AppText>
              <View
                accessible={false}
                className="shrink-0 flex-row items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 dark:bg-violet-950/50"
              >
                <AppText className="text-[13px] font-semibold text-violet-700 dark:text-violet-300">
                  Sort
                </AppText>
                <Ionicons
                  name="options-outline"
                  size={16}
                  color={scheme === "dark" ? "#c4b5fd" : "#6d28d9"}
                />
              </View>
            </View>
            <AppText className="mt-0.5 text-[13px] leading-snug text-muted">
              Tap an item to assign or edit split.
            </AppText>
          </View>
        </View>
      </View>

      <View className="mx-1.5 gap-0">
        {lines.map((line, index) => {
          const ids = displayAssignments[line.id] ?? [];
          const assigned = ids
            .map((id) => memberById.get(id))
            .filter((member): member is AssignMember => member !== undefined);

          return (
            <AssignItemCard
              key={line.id}
              activeMemberId={activeMemberId}
              assigned={assigned}
              formatAmount={formatAmount}
              index={index}
              line={line}
              onPress={() => onLinePress(line)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

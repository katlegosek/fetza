import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, View } from "react-native";

import { AppText } from "@/components";
import {
  assignMemberChipBorderStyle,
  assignMemberChipShellClassName,
} from "@/screens/assign/assign-member-chip";
import type { AssignMember } from "@/screens/assign/assign.constants";
import { AssignMemberChipFace } from "@/screens/assign/components";
import { participantInitials } from "@/utils/participant";

export type AssignPeopleRowProps = {
  members: AssignMember[];
  activeMemberId: string | null;
  peopleSectionTitle: string;
  peopleSectionSubtitle: string;
  foregroundColor: string;
  onAddMember: () => void;
  onSelectMember: (memberId: string | null) => void;
  onCloseSheet: () => void;
};

export const AssignPeopleRow = ({
  members,
  activeMemberId,
  peopleSectionTitle,
  peopleSectionSubtitle,
  foregroundColor,
  onAddMember,
  onSelectMember,
  onCloseSheet,
}: AssignPeopleRowProps) => {
  return (
    <View className="px-0 pb-1 pt-1">
      <View className="flex-row items-start gap-3 px-4 pb-3 pt-3">
        <View className="size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 dark:bg-violet-500/20">
          <Ionicons name="people" size={22} color="#7c3aed" />
        </View>
        <View className="min-w-0 flex-1 pt-0.5">
          <AppText className="text-lg font-bold tracking-tight text-foreground">
            {peopleSectionTitle}
          </AppText>
          <AppText className="mt-0.5 text-[13px] leading-snug text-muted">
            {peopleSectionSubtitle}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Member"
          className="mt-0.5 shrink-0 flex-row items-center gap-1 rounded-full border border-borderSubtle bg-white px-3.5 py-2.5 active:opacity-80 dark:bg-neutral-900"
          onPress={onAddMember}
        >
          <Ionicons name="add" size={18} color={foregroundColor} />
          <AppText className="text-sm font-semibold text-foreground">
            Add
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        accessibilityHint={
          activeMemberId
            ? `Tap receipt lines to add or remove ${members.find((member) => member.id === activeMemberId)?.name ?? "the selected person"}.`
            : "Tap a line to choose who shared it, or select a person to tag lines quickly."
        }
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        className="pb-4 pt-1"
        contentContainerClassName="flex-row items-center gap-2 px-4"
      >
        {members.map((member) => {
          const active = member.id === activeMemberId;
          const isYou =
            member.isHost === true ||
            member.id === "m-you" ||
            member.name.trim().toLowerCase() === "you";

          return (
            <Pressable
              key={member.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Assign to ${member.name}`}
              hitSlop={6}
              style={({ pressed }) => ({
                opacity: pressed ? 0.88 : 1,
              })}
              onPress={() => {
                onCloseSheet();
                onSelectMember(activeMemberId === member.id ? null : member.id);
              }}
            >
              <View
                className={assignMemberChipShellClassName()}
                style={assignMemberChipBorderStyle(active, member.tone)}
              >
                <AssignMemberChipFace
                  avatarBackgroundColor={member.avatarBackgroundColor}
                  avatarTextColor={member.avatarTextColor}
                  initialsText={participantInitials(member.name)}
                  name={member.name}
                  showYouRibbon={isYou}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

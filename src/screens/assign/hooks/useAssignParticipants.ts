import { type Dispatch, type SetStateAction, useCallback } from "react";
import { Alert } from "react-native";

import { useBillParticipants } from "@/hooks";
import {
  avatarTonesForPaletteIndex,
  memberChipBorderToneForIndex,
} from "@/lib/member-avatar-tones";
import type { AssignMember } from "@/screens/assign/assign.constants";
import { buildParticipantInput } from "@/utils/participant-input";

export type UseAssignParticipantsOptions = {
  billId: number;
  isApiMode: boolean;
  members: AssignMember[];
  setMembers?: Dispatch<SetStateAction<AssignMember[]>>;
  setActiveMember: (memberId: string | null) => void;
  showAssignmentError: (error: unknown) => void;
};

export function useAssignParticipants({
  billId,
  isApiMode,
  members,
  setMembers,
  setActiveMember,
  showAssignmentError,
}: UseAssignParticipantsOptions) {
  const billParticipants = useBillParticipants(billId);

  const addMemberWithName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }

      if (isApiMode) {
        const seatIndex = members.length;
        billParticipants.createParticipant.mutate(
          { participant: buildParticipantInput(trimmed, seatIndex) },
          {
            onError: showAssignmentError,
            onSuccess: (response) => {
              setActiveMember(String(response.participant.id));
            },
          },
        );
        return;
      }

      const id = `m-${Date.now().toString(36)}`;
      setMembers?.((previous) => {
        const index = previous.length;
        return [
          {
            id,
            name: trimmed,
            tone: memberChipBorderToneForIndex(index),
            ...avatarTonesForPaletteIndex(index),
          },
          ...previous,
        ];
      });
      setActiveMember(id);
    },
    [
      billParticipants.createParticipant,
      isApiMode,
      members.length,
      setActiveMember,
      setMembers,
      showAssignmentError,
    ],
  );

  const handleAddMember = useCallback(() => {
    const isIOS = typeof Alert.prompt === "function";
    if (isIOS) {
      Alert.prompt(
        "Add Member",
        "Who's splitting this bill?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add",
            onPress: (name?: string) => {
              if (name) {
                addMemberWithName(name);
              }
            },
          },
        ],
        "plain-text",
      );
      return;
    }

    addMemberWithName(`Person ${members.length + 1}`);
  }, [addMemberWithName, members.length]);

  const handleManagePeople = useCallback(() => {
    Alert.alert(
      "Manage people",
      "Use + Add beside People to add someone. Tap a person, then tap receipt lines to assign items to them.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Add person", onPress: () => handleAddMember() },
      ],
    );
  }, [handleAddMember]);

  return {
    billParticipants,
    handleAddMember,
    handleManagePeople,
    addMemberWithName,
  };
}

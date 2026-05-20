import type { MemberAvatarTones } from "@/lib/member-avatar-tones";
import {
  avatarTonesForPaletteIndex,
  memberChipBorderToneForIndex,
} from "@/lib/member-avatar-tones";
import type {
  BillParticipant,
  BillShowResponse,
  ItemAssignment,
  ReceiptItem,
} from "@/types/api";

export type AssignMember = {
  id: string;
  name: string;
  tone: string;
  isHost: boolean;
} & MemberAvatarTones;

export type AssignLine = {
  id: string;
  qty: number;
  description: string;
  amountCents: number;
};

export type AssignmentsByLineId = Record<string, string[]>;

function sortParticipants(participants: BillParticipant[]): BillParticipant[] {
  return [...participants].sort((a, b) => {
    const aSeat = a.seat_index ?? Number.MAX_SAFE_INTEGER;
    const bSeat = b.seat_index ?? Number.MAX_SAFE_INTEGER;
    if (aSeat !== bSeat) {
      return aSeat - bSeat;
    }

    return a.name.localeCompare(b.name);
  });
}

export function billParticipantsToAssignMembers(
  participants: BillParticipant[],
): AssignMember[] {
  return sortParticipants(participants).map((participant, index) => {
    const tones =
      participant.avatar_background_color && participant.avatar_text_color
        ? {
            avatarBackgroundColor: participant.avatar_background_color,
            avatarTextColor: participant.avatar_text_color,
          }
        : avatarTonesForPaletteIndex(index);

    return {
      id: String(participant.id),
      name: participant.name,
      isHost: participant.is_host,
      tone: memberChipBorderToneForIndex(index),
      ...tones,
    };
  });
}

export function receiptItemsToAssignLines(
  receiptItems: ReceiptItem[],
): AssignLine[] {
  return [...receiptItems]
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      id: String(item.id),
      qty: item.quantity,
      description: item.name,
      amountCents: item.total_cents,
    }));
}

export function itemAssignmentsByLineId(
  itemAssignments: ItemAssignment[],
): AssignmentsByLineId {
  const map: AssignmentsByLineId = {};

  for (const assignment of itemAssignments) {
    const lineId = String(assignment.receipt_item_id);
    const participantId = String(assignment.bill_participant_id);
    if (!map[lineId]) {
      map[lineId] = [];
    }
    map[lineId].push(participantId);
  }

  for (const lineId of Object.keys(map)) {
    map[lineId] = [...new Set(map[lineId])].sort();
  }

  return map;
}

function equalAmountsCents(totalCents: number, count: number): number[] {
  if (count <= 0) {
    return [];
  }

  const base = Math.floor(totalCents / count);
  const remainder = totalCents % count;

  return Array.from({ length: count }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}

/** Applies equal-split assignments for one receipt item into a bill detail cache snapshot. */
export function applyOptimisticItemAssignments(
  bill: BillShowResponse,
  receiptItemId: number,
  participantIds: number[],
): BillShowResponse {
  const receiptItem = bill.receipt_items.find(
    (item) => item.id === receiptItemId,
  );
  if (!receiptItem) {
    return bill;
  }

  const remaining = bill.item_assignments.filter(
    (assignment) => assignment.receipt_item_id !== receiptItemId,
  );

  const orderedParticipantIds = participantIds.filter((id) =>
    bill.bill_participants.some((participant) => participant.id === id),
  );

  const amounts = equalAmountsCents(
    receiptItem.total_cents,
    orderedParticipantIds.length,
  );
  const now = new Date().toISOString();

  const optimisticAssignments: ItemAssignment[] = orderedParticipantIds.map(
    (participantId, index) => ({
      id: -(receiptItemId * 1_000 + index + 1),
      receipt_item_id: receiptItemId,
      bill_participant_id: participantId,
      amount_cents: amounts[index] ?? 0,
      split_method: "equal",
      created_at: now,
      updated_at: now,
    }),
  );

  return {
    ...bill,
    item_assignments: [...remaining, ...optimisticAssignments],
  };
}

export function billShowToAssignData(data: BillShowResponse): {
  members: AssignMember[];
  lines: AssignLine[];
  assignments: AssignmentsByLineId;
  merchantLabel: string;
} {
  const { bill, receipt, receipt_items, bill_participants, item_assignments } =
    data;

  const merchantLabel =
    receipt?.merchant_name?.trim() || bill.receipt_name?.trim() || bill.title;

  return {
    members: billParticipantsToAssignMembers(bill_participants),
    lines: receiptItemsToAssignLines(receipt_items),
    assignments: itemAssignmentsByLineId(item_assignments),
    merchantLabel,
  };
}

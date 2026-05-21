import type { MemberAvatarTones } from "@/lib/member-avatar-tones";

export type AssignMember = {
  id: string;
  name: string;
  tone: string;
  isHost?: boolean;
} & MemberAvatarTones;

export type Assignments = Record<string, string[]>;

export type AssignSheetState =
  | { kind: "line"; lineId: string }
  | { kind: "merchant" }
  | { kind: "totals" }
  | null;

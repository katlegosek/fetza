import {
  avatarTonesForPaletteIndex,
  memberChipBorderToneForIndex,
} from "@/lib/member-avatar-tones";
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

const SEED_MEMBER_ROWS: { id: string; name: string }[] = [
  { id: "m-you", name: "You" },
  { id: "m-2", name: "Alex" },
  { id: "m-3", name: "Sam" },
  { id: "m-4", name: "Joseph" },
  { id: "m-5", name: "James" },
  { id: "m-6", name: "Jessie" },
  { id: "m-7", name: "Morgan" },
  { id: "m-8", name: "Taylor" },
];

export const SEED_MEMBERS: AssignMember[] = SEED_MEMBER_ROWS.map((row, i) => ({
  ...row,
  ...avatarTonesForPaletteIndex(i),
  tone: memberChipBorderToneForIndex(i),
}));

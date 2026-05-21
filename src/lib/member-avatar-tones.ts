export type MemberAvatarTones = {
  avatarBackgroundColor: string;
  avatarTextColor: string;
};

export const AVATAR_TONAL_PALETTE: MemberAvatarTones[] = [
  { avatarBackgroundColor: "#123B3C", avatarTextColor: "#89D9D0" },
  { avatarBackgroundColor: "#1E3A5F", avatarTextColor: "#8FC7F2" },
  { avatarBackgroundColor: "#3A2A67", avatarTextColor: "#BBA5FF" },
  { avatarBackgroundColor: "#4A2E18", avatarTextColor: "#F2B76B" },
  { avatarBackgroundColor: "#153F2A", avatarTextColor: "#8DD9A8" },
  { avatarBackgroundColor: "#4A1F2E", avatarTextColor: "#F29AB3" },
  { avatarBackgroundColor: "#3D3518", avatarTextColor: "#E6D47A" },
  { avatarBackgroundColor: "#263238", avatarTextColor: "#B0BEC5" },
];

/**
 * Tailwind `border-[hex]` classes for active assign/share chips (second token of `Member.tone`).
 * First token is unused when avatars use hex fills.
 */
export const MEMBER_CHIP_BORDER_TONES = [
  "_ border-[#123B3C]",
  "_ border-[#1E3A5F]",
  "_ border-[#3A2A67]",
  "_ border-[#4A2E18]",
  "_ border-[#153F2A]",
  "_ border-[#4A1F2E]",
  "_ border-[#3D3518]",
  "_ border-[#263238]",
] as const;

export function avatarTonesForPaletteIndex(index: number): MemberAvatarTones {
  const len = AVATAR_TONAL_PALETTE.length;
  const safe = ((index % len) + len) % len;
  return AVATAR_TONAL_PALETTE[safe] as MemberAvatarTones;
}

export function memberChipBorderToneForIndex(index: number): string {
  const len = MEMBER_CHIP_BORDER_TONES.length;
  const safe = ((index % len) + len) % len;
  return MEMBER_CHIP_BORDER_TONES[safe] as string;
}
